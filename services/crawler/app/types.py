from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, HttpUrl


class ProductSelectors(BaseModel):
    title: Optional[str] = None
    price: Optional[str] = None
    currency: Optional[str] = None
    image: Optional[str] = None
    sku: Optional[str] = None
    availability: Optional[str] = None


class SourceConfig(BaseModel):
    name: str = Field(min_length=1)
    list_pages: List[HttpUrl] = Field(default_factory=list)
    product_pages: List[HttpUrl] = Field(default_factory=list)
    item_link_selector: str = "a"
    item_link_attribute: str = "href"
    product: ProductSelectors


class CrawlRequest(BaseModel):
    sources: List[SourceConfig]
    concurrency: int = 4
    request_timeout_ms: int = 20000
    callback_url: Optional[HttpUrl] = None


class ScrapedProduct(BaseModel):
    source: str
    url: str
    title: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[str] = None
    sku: Optional[str] = None
    availability: Optional[str] = None
    scraped_at: str


JobStatus = Literal["queued", "running", "completed", "failed"]


class JobView(BaseModel):
    id: str
    status: JobStatus
    count: int = 0
    error: Optional[str] = None


class JobItemsView(BaseModel):
    id: str
    status: JobStatus
    items: List[ScrapedProduct]
    meta: Dict[str, Any] = Field(default_factory=dict)
