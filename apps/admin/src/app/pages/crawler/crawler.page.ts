import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CrawlerService, JobItemsView, JobView } from '../../core/crawler/crawler.service';

const crawlerBaseUrlKey = 'crawler.baseUrl.v1';

function normalizeBaseUrl(input: string): string {
  const value = input.trim().replace(/\/+$/, '');
  return value || 'http://localhost:8000';
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function defaultRequestBody(): string {
  return JSON.stringify(
    {
      concurrency: 4,
      request_timeout_ms: 20000,
      sources: [
        {
          name: 'example-store',
          list_pages: ['https://example.com/products'],
          item_link_selector: 'a',
          item_link_attribute: 'href',
          product: { title: 'h1', price: '.price', image: 'img' },
        },
      ],
    },
    null,
    2
  );
}

@Component({
  selector: 'app-crawler-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crawler.page.html',
  styleUrl: './crawler.page.scss',
})
export class CrawlerPage {
  private readonly api = inject(CrawlerService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly job = signal<JobView | null>(null);
  protected readonly items = signal<JobItemsView | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    baseUrl: [this.loadBaseUrl(), [Validators.required]],
    jobId: [''],
    requestBody: [defaultRequestBody(), [Validators.required]],
  });

  protected readonly baseUrl = computed(() => normalizeBaseUrl(this.form.controls.baseUrl.value));

  createJob(): void {
    if (this.loading() || this.form.controls.requestBody.invalid) return;
    this.error.set('');
    this.items.set(null);
    this.job.set(null);

    const parsed = safeJsonParse(this.form.controls.requestBody.value);
    if (!parsed || typeof parsed !== 'object') {
      this.error.set('Invalid JSON request body');
      return;
    }

    this.persistBaseUrl();
    this.loading.set(true);
    this.api.createJob(this.baseUrl(), parsed as never).subscribe({
      next: (data) => {
        this.job.set(data);
        this.form.controls.jobId.setValue(data.id);
      },
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to create job');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  refreshJob(): void {
    if (this.loading() || this.form.controls.jobId.invalid) return;
    const jobId = this.form.controls.jobId.value.trim();
    if (!jobId) return;

    this.error.set('');
    this.persistBaseUrl();
    this.loading.set(true);
    this.api.getJob(this.baseUrl(), jobId).subscribe({
      next: (data) => this.job.set(data),
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to load job');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  fetchItems(): void {
    if (this.loading() || this.form.controls.jobId.invalid) return;
    const jobId = this.form.controls.jobId.value.trim();
    if (!jobId) return;

    this.error.set('');
    this.persistBaseUrl();
    this.loading.set(true);
    this.api.getItems(this.baseUrl(), jobId).subscribe({
      next: (data) => this.items.set(data),
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to load items');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadBaseUrl(): string {
    const raw = localStorage.getItem(crawlerBaseUrlKey);
    return raw ? normalizeBaseUrl(raw) : 'http://localhost:8000';
  }

  private persistBaseUrl(): void {
    localStorage.setItem(crawlerBaseUrlKey, this.baseUrl());
  }

  private extractErrorMessage(e: unknown): string {
    if (!e || typeof e !== 'object') return '';
    const anyError = e as { error?: unknown; message?: unknown };
    const body = anyError.error as { detail?: unknown; message?: unknown } | undefined;
    if (body) {
      if (typeof body.detail === 'string') return body.detail;
      if (typeof body.message === 'string') return body.message;
    }
    if (typeof anyError.message === 'string') return anyError.message;
    return '';
  }
}

