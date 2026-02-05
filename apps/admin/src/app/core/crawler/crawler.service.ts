import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type CrawlRequest = {
  sources: unknown[];
  concurrency?: number;
  request_timeout_ms?: number;
  callback_url?: string;
};

export type JobView = {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  count: number;
  error?: string | null;
};

export type ScrapedPage = {
  source: string;
  url: string;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  image_url?: string | null;
  sku?: string | null;
  availability?: string | null;
  scraped_at: string;
  raw_html?: string | null;
  page_info?: Record<string, unknown>;
  page_markdown?: string | null;
};

export type JobItemsView = {
  id: string;
  status: JobView['status'];
  items: ScrapedPage[];
  meta?: Record<string, unknown>;
};

@Injectable({ providedIn: 'root' })
export class CrawlerService {
  constructor(private readonly http: HttpClient) {}

  createJob(baseUrl: string, payload: CrawlRequest): Observable<JobView> {
    return this.http.post<JobView>(`${baseUrl}/crawler/jobs`, payload);
  }

  getJob(baseUrl: string, jobId: string): Observable<JobView> {
    return this.http.get<JobView>(`${baseUrl}/crawler/jobs/${encodeURIComponent(jobId)}`);
  }

  getItems(baseUrl: string, jobId: string): Observable<JobItemsView> {
    return this.http.get<JobItemsView>(`${baseUrl}/crawler/jobs/${encodeURIComponent(jobId)}/items`);
  }
}

