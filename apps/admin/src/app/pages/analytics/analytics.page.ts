import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  signal,
} from '@angular/core';

import { ApiService, Order } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

import * as echarts from 'echarts';

type StatusKey = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'unknown';

type StatusStat = {
  status: StatusKey;
  label: string;
  count: number;
  percent: number;
};

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.scss',
})
export class AnalyticsPage implements OnInit, OnDestroy {
  @ViewChild('statusChart', { static: true }) private readonly statusChartEl?: ElementRef<HTMLElement>;
  @ViewChild('revenueChart', { static: true }) private readonly revenueChartEl?: ElementRef<HTMLElement>;

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly orders = signal<Order[]>([]);

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);

  protected readonly totalOrders = computed(() => this.orders().length);
  protected readonly totalRevenue = computed(() =>
    this.orders().reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
  );

  protected readonly revenueByDay = computed(() => {
    const map = new Map<string, number>();
    for (const order of this.orders()) {
      const createdAt = typeof order.createdAt === 'string' ? order.createdAt : '';
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10); // yyyy-mm-dd
      map.set(day, (map.get(day) ?? 0) + (Number(order.totalAmount) || 0));
    }
    const days = Array.from(map.keys()).sort();
    return {
      days,
      totals: days.map(d => map.get(d) ?? 0),
    };
  });

  protected readonly statusStats = computed<StatusStat[]>(() => {
    const totals = this.totalOrders();
    const counts: Record<StatusKey, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      unknown: 0,
    };

    for (const order of this.orders()) {
      const raw = (order.status || '').toLowerCase();
      const key =
        raw === 'pending' ||
        raw === 'processing' ||
        raw === 'shipped' ||
        raw === 'delivered' ||
        raw === 'cancelled'
          ? (raw as Exclude<StatusKey, 'unknown'>)
          : 'unknown';
      counts[key] += 1;
    }

    const rows: Array<{ status: StatusKey; label: string }> = [
      { status: 'pending', label: 'pending' },
      { status: 'processing', label: 'processing' },
      { status: 'shipped', label: 'shipped' },
      { status: 'delivered', label: 'delivered' },
      { status: 'cancelled', label: 'cancelled' },
    ];
    if (counts.unknown > 0) rows.push({ status: 'unknown', label: 'unknown' });

    return rows
      .map(r => {
        const count = counts[r.status];
        const percent = totals > 0 ? (count / totals) * 100 : 0;
        return { status: r.status, label: r.label, count, percent };
      })
      .sort((a, b) => b.count - a.count);
  });

  private statusChart?: echarts.ECharts;
  private revenueChart?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
    effect(() => {
      this.renderCharts();
    });
  }

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.statusChart?.dispose();
    this.revenueChart?.dispose();
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getOrders(this.apiBaseUrl(), 'all').subscribe({
      next: (items) => this.orders.set(items),
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load analytics'),
      complete: () => this.loading.set(false),
    });
  }

  trackByStatus(_: number, item: StatusStat): string {
    return item.status;
  }

  private renderCharts(): void {
    const statusEl = this.statusChartEl?.nativeElement;
    const revenueEl = this.revenueChartEl?.nativeElement;
    if (!statusEl || !revenueEl) return;

    if (!this.statusChart) this.statusChart = echarts.init(statusEl);
    if (!this.revenueChart) this.revenueChart = echarts.init(revenueEl);

    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.statusChart?.resize();
        this.revenueChart?.resize();
      });
      this.resizeObserver.observe(statusEl);
      this.resizeObserver.observe(revenueEl);
    }

    const statusData = this.statusStats()
      .filter(s => s.count > 0)
      .map(s => ({ name: s.label, value: s.count }));

    const hasData = this.totalOrders() > 0;

    const palette = {
      text: '#181818',
      border: '#d8dde6',
      accent: '#0176d3',
      accentArea: 'rgba(1, 118, 211, 0.12)',
    };

    this.statusChart.setOption(
      {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        legend: {
          top: 0,
          textStyle: { color: palette.text },
        },
        series: [
          {
            name: 'Orders',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '58%'],
            avoidLabelOverlap: true,
            label: { color: palette.text },
            emphasis: { label: { fontWeight: 'bold' } },
            data: hasData ? statusData : [{ name: 'No data', value: 1 }],
          },
        ],
      },
      { notMerge: true }
    );

    const revenue = this.revenueByDay();
    this.revenueChart.setOption(
      {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis' },
        grid: { left: 44, right: 16, top: 24, bottom: 44 },
        xAxis: {
          type: 'category',
          data: revenue.days,
          axisLabel: { color: palette.text },
          axisLine: { lineStyle: { color: palette.border } },
        },
        yAxis: {
          type: 'value',
          axisLabel: { color: palette.text },
          splitLine: { lineStyle: { color: palette.border } },
        },
        series: [
          {
            name: 'Revenue',
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: { width: 3, color: palette.accent },
            areaStyle: { color: palette.accentArea },
            data: hasData ? revenue.totals : [],
          },
        ],
      },
      { notMerge: true }
    );
  }

  private extractErrorMessage(e: unknown): string {
    if (!e || typeof e !== 'object') return '';
    const anyError = e as { error?: unknown; message?: unknown };
    const body = anyError.error as { message?: unknown } | undefined;
    if (body && typeof body.message === 'string') return body.message;
    if (typeof anyError.message === 'string') return anyError.message;
    return '';
  }
}

