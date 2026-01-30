from __future__ import annotations

import asyncio
import re
from datetime import datetime, timezone
from typing import List, Optional, Set
from urllib.parse import urljoin

import httpx
from bs4 import BeautifulSoup

from .types import CrawlRequest, ScrapedProduct, SourceConfig


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _normalize_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    text = " ".join(value.split()).strip()
    return text if text else None


def _parse_price(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    cleaned = text.replace(",", " ").strip()
    match = re.search(r"(\d+(\.\d+)?)", cleaned)
    if not match:
        return None
    try:
        value = float(match.group(1))
    except ValueError:
        return None
    return value


def _extract_text(html: str, selector: Optional[str]) -> Optional[str]:
    if not selector:
        return None
    soup = BeautifulSoup(html, "html.parser")
    node = soup.select_one(selector)
    if node is None:
        return None
    return _normalize_text(node.get_text())


def _extract_attr(html: str, selector: Optional[str], attribute: str, base_url: str) -> Optional[str]:
    if not selector:
        return None
    soup = BeautifulSoup(html, "html.parser")
    node = soup.select_one(selector)
    if node is None:
        return None
    raw = node.get(attribute)
    if not raw:
        return None
    return urljoin(base_url, raw)


def _extract_links(html: str, base_url: str, selector: str, attribute: str) -> List[str]:
    soup = BeautifulSoup(html, "html.parser")
    urls: Set[str] = set()
    for node in soup.select(selector):
        raw = node.get(attribute)
        if not raw:
            continue
        urls.add(urljoin(base_url, raw))
    return list(urls)


async def _fetch_text(client: httpx.AsyncClient, url: str) -> str:
    resp = await client.get(url)
    resp.raise_for_status()
    return resp.text


async def _resolve_product_urls(
    client: httpx.AsyncClient, source: SourceConfig
) -> List[str]:
    urls: Set[str] = set([str(x) for x in source.product_pages])
    for list_url in source.list_pages:
        html = await _fetch_text(client, str(list_url))
        links = _extract_links(
            html=html,
            base_url=str(list_url),
            selector=source.item_link_selector,
            attribute=source.item_link_attribute,
        )
        urls.update(links)
    return list(urls)


async def _scrape_product(
    client: httpx.AsyncClient, source_name: str, url: str, selectors: SourceConfig
) -> ScrapedProduct:
    html = await _fetch_text(client, url)
    title = _extract_text(html, selectors.product.title)
    price_text = _extract_text(html, selectors.product.price)
    currency = _extract_text(html, selectors.product.currency)
    image_url = _extract_attr(html, selectors.product.image, "src", url)
    sku = _extract_text(html, selectors.product.sku)
    availability = _extract_text(html, selectors.product.availability)

    return ScrapedProduct(
        source=source_name,
        url=url,
        title=title,
        price=_parse_price(price_text),
        currency=currency,
        image_url=image_url,
        sku=sku,
        availability=availability,
        scraped_at=_now_iso(),
    )


async def crawl(request: CrawlRequest) -> List[ScrapedProduct]:
    concurrency = max(1, int(request.concurrency))
    timeout = httpx.Timeout(request.request_timeout_ms / 1000.0)
    headers = {"user-agent": "shopping-system-crawler/1.0", "accept": "text/html,application/xhtml+xml"}

    async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
        sem = asyncio.Semaphore(concurrency)
        items: List[ScrapedProduct] = []

        async def run_one(url: str, src: SourceConfig) -> ScrapedProduct:
            async with sem:
                return await _scrape_product(client, src.name, url, src)

        for src in request.sources:
            product_urls = await _resolve_product_urls(client, src)
            tasks = [asyncio.create_task(run_one(url, src)) for url in product_urls]
            results = await asyncio.gather(*tasks)
            items.extend(results)

        return items
