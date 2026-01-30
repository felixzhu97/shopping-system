from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .types import JobStatus, ScrapedProduct


@dataclass
class JobRecord:
    id: str
    status: JobStatus = "queued"
    items: List[ScrapedProduct] = field(default_factory=list)
    error: Optional[str] = None


class JobStore:
    def __init__(self) -> None:
        self._jobs: Dict[str, JobRecord] = {}

    def create(self, job_id: str) -> JobRecord:
        record = JobRecord(id=job_id)
        self._jobs[job_id] = record
        return record

    def get(self, job_id: str) -> Optional[JobRecord]:
        return self._jobs.get(job_id)

    def set_status(self, job_id: str, status: JobStatus) -> None:
        job = self._jobs.get(job_id)
        if job is None:
            return
        job.status = status

    def set_error(self, job_id: str, message: str) -> None:
        job = self._jobs.get(job_id)
        if job is None:
            return
        job.status = "failed"
        job.error = message

    def set_items(self, job_id: str, items: List[ScrapedProduct]) -> None:
        job = self._jobs.get(job_id)
        if job is None:
            return
        job.items = items
        job.status = "completed"
