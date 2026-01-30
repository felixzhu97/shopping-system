from __future__ import annotations

import asyncio
import uuid
import os
from typing import Any, Dict

import httpx
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .crawler import crawl
from .store import JobStore
from .types import CrawlRequest, JobItemsView, JobView, ScrapedProduct


app = FastAPI()
store = JobStore()

allowed_origins = os.getenv("CRAWLER_ALLOWED_ORIGINS", "http://localhost:4200")
origins = [x.strip() for x in allowed_origins.split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/crawler/jobs", response_model=JobView)
async def create_job(request: CrawlRequest, background: BackgroundTasks) -> JobView:
    job_id = uuid.uuid4().hex
    store.create(job_id)
    background.add_task(_run_job, job_id, request)
    return JobView(id=job_id, status="queued", count=0, error=None)


@app.get("/crawler/jobs/{job_id}", response_model=JobView)
async def get_job(job_id: str) -> JobView:
    job = store.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobView(id=job.id, status=job.status, count=len(job.items), error=job.error)


@app.get("/crawler/jobs/{job_id}/items", response_model=JobItemsView)
async def get_job_items(job_id: str) -> JobItemsView:
    job = store.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobItemsView(id=job.id, status=job.status, items=job.items, meta={"count": len(job.items)})


async def _run_job(job_id: str, request: CrawlRequest) -> None:
    store.set_status(job_id, "running")
    try:
        items = await crawl(request)
    except Exception as exc:
        store.set_error(job_id, str(exc))
        return

    store.set_items(job_id, items)
    if request.callback_url:
        await _post_callback(str(request.callback_url), job_id, items)


async def _post_callback(url: str, job_id: str, items: list[ScrapedProduct]) -> None:
    payload: Dict[str, Any] = {"id": job_id, "count": len(items), "items": [x.model_dump() for x in items]}
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
            await client.post(url, json=payload)
    except Exception:
        await asyncio.sleep(0)
