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

export type JobItemsView = {
  id: string;
  status: JobView['status'];
  items: unknown[];
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

