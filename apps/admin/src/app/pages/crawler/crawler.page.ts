import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CrawlerService, JobItemsView, JobView } from '../../core/crawler/crawler.service';

const crawlerBaseUrlKey = 'crawler.baseUrl.v1';

function normalizeBaseUrl(input: string): string {
  const value = input.trim().replace(/\/+$/, '');
  return value || 'http://localhost:8000';
}

function normalizePageUrl(input: string): string {
  const value = input.trim();
  if (!value) return '';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
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

  private itemsPollHandle: number | null = null;

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly job = signal<JobView | null>(null);
  protected readonly items = signal<JobItemsView | null>(null);
  protected readonly activeTab = signal<'summary' | 'json' | 'markdown' | 'raw'>('summary');

  protected readonly form = this.fb.nonNullable.group({
    baseUrl: [this.loadBaseUrl(), [Validators.required]],
    jobId: [''],
    pageUrl: ['', [Validators.required]],
  });

  protected readonly baseUrl = computed(() => normalizeBaseUrl(this.form.controls.baseUrl.value));

  setTab(tab: 'summary' | 'json' | 'markdown' | 'raw'): void {
    this.activeTab.set(tab);
  }

  createJob(): void {
    if (this.loading() || this.form.invalid) return;
    this.error.set('');
    this.items.set(null);
    this.job.set(null);

    this.persistBaseUrl();
    const pageUrl = normalizePageUrl(this.form.controls.pageUrl.value);
    if (!pageUrl) {
      this.error.set('Page URL is required');
      return;
    }

    const payload = {
      concurrency: 2,
      request_timeout_ms: 15000,
      callback_url: undefined,
      sources: [
        {
          name: 'single-page',
          list_pages: [],
          product_pages: [pageUrl],
          item_link_selector: 'a',
          item_link_attribute: 'href',
          product: {
            title: 'h1',
            price: '.price',
            currency: '',
            image: 'img',
            sku: '',
            availability: '',
          },
        },
      ],
    };

    this.loading.set(true);
    this.api.createJob(this.baseUrl(), payload).subscribe({
      next: (data) => {
        this.job.set(data);
        this.form.controls.jobId.setValue(data.id);
        this.startItemsPoll(data.id);
      },
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to create job');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  refreshJob(): void {
    if (this.loading()) return;
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
    if (this.loading()) return;
    const jobId = this.form.controls.jobId.value.trim();
    if (!jobId) return;

    this.error.set('');
    this.persistBaseUrl();
    this.startItemsPoll(jobId);
  }

  private startItemsPoll(jobId: string): void {
    this.stopItemsPoll();
    this.loadItems(jobId, 12);
  }

  private loadItems(jobId: string, remaining: number): void {
    if (remaining <= 0) return;
    this.loading.set(true);
    this.api.getItems(this.baseUrl(), jobId).subscribe({
      next: (data) => {
        const count = Array.isArray((data as never as { items?: unknown[] }).items)
          ? (data as never as { items: unknown[] }).items.length
          : 0;
        this.items.set(data);
        this.job.set({ id: data.id, status: data.status, count, error: null });
        if (data.status === 'completed' || data.status === 'failed') {
          this.stopItemsPoll();
          return;
        }
        this.scheduleNextItemsPoll(jobId, remaining - 1);
      },
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to load items');
        this.loading.set(false);
        this.stopItemsPoll();
      },
      complete: () => this.loading.set(false),
    });
  }

  private scheduleNextItemsPoll(jobId: string, remaining: number): void {
    this.itemsPollHandle = window.setTimeout(() => this.loadItems(jobId, remaining), 1000);
  }

  private stopItemsPoll(): void {
    if (this.itemsPollHandle !== null) {
      window.clearTimeout(this.itemsPollHandle);
      this.itemsPollHandle = null;
    }
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

