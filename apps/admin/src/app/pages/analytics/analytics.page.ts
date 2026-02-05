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

import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GetRowIdParams, GridOptions } from 'ag-grid-community';

import { adminGridTheme } from '../../core/ag-grid/ag-grid-theme';
import { ApiService, Order, Product, User } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

import * as echarts from 'echarts';

type AnalyticsTab = 'orders' | 'products' | 'users';

const CHART_COLORS = [
  '#4285F4',
  '#34A853',
  '#FBBC04',
  '#EA4335',
  '#2196F3',
  '#009688',
  '#9C27B0',
  '#FF9800',
];

type StatusKey = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'unknown';

type StatusStat = {
  status: StatusKey;
  label: string;
  count: number;
  percent: number;
};

const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PERCENT_FORMAT = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatShortDate(isoDate: string): string {
  if (!isoDate || isoDate.length < 10) return isoDate;
  const d = new Date(isoDate.slice(0, 10));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './analytics.page.html',
  styleUrl: './analytics.page.scss',
})
export class AnalyticsPage implements OnInit, OnDestroy {
  @ViewChild('ordersBarChart', { static: true }) private readonly ordersBarChartEl?: ElementRef<HTMLElement>;
  @ViewChild('ordersLineChart', { static: true }) private readonly ordersLineChartEl?: ElementRef<HTMLElement>;
  @ViewChild('ordersScatterChart', { static: true }) private readonly ordersScatterChartEl?: ElementRef<HTMLElement>;
  @ViewChild('ordersPieChart', { static: true }) private readonly ordersPieChartEl?: ElementRef<HTMLElement>;
  @ViewChild('productsBarChart', { static: true }) private readonly productsBarChartEl?: ElementRef<HTMLElement>;
  @ViewChild('productsLineChart', { static: true }) private readonly productsLineChartEl?: ElementRef<HTMLElement>;
  @ViewChild('productsScatterChart', { static: true }) private readonly productsScatterChartEl?: ElementRef<HTMLElement>;
  @ViewChild('productsPieChart', { static: true }) private readonly productsPieChartEl?: ElementRef<HTMLElement>;
  @ViewChild('usersBarChart', { static: true }) private readonly usersBarChartEl?: ElementRef<HTMLElement>;
  @ViewChild('usersLineChart', { static: true }) private readonly usersLineChartEl?: ElementRef<HTMLElement>;
  @ViewChild('usersScatterChart', { static: true }) private readonly usersScatterChartEl?: ElementRef<HTMLElement>;
  @ViewChild('usersPieChart', { static: true }) private readonly usersPieChartEl?: ElementRef<HTMLElement>;

  protected readonly activeTab = signal<AnalyticsTab>('orders');
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly orders = signal<Order[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly productsLoading = signal<boolean>(false);
  protected readonly productsError = signal<string>('');
  protected readonly users = signal<User[]>([]);
  protected readonly usersLoading = signal<boolean>(false);
  protected readonly usersError = signal<string>('');

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);
  protected readonly formatCurrency = (value: number) => CURRENCY_FORMAT.format(value);
  protected readonly formatPercent = (value: number) => PERCENT_FORMAT.format(value / 100);

  protected readonly totalOrders = computed(() => this.orders().length);
  protected readonly totalRevenue = computed(() =>
    this.orders().reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
  );
  protected readonly averageOrderValue = computed(() => {
    const n = this.totalOrders();
    return n > 0 ? this.totalRevenue() / n : 0;
  });

  protected readonly revenueByDay = computed(() => {
    const map = new Map<string, number>();
    for (const order of this.orders()) {
      const createdAt = typeof order.createdAt === 'string' ? order.createdAt : '';
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + (Number(order.totalAmount) || 0));
    }
    const days = Array.from(map.keys()).sort();
    return {
      days,
      labels: days.map(d => formatShortDate(d)),
      totals: days.map(d => map.get(d) ?? 0),
    };
  });

  protected readonly ordersByDay = computed(() => {
    const map = new Map<string, number>();
    for (const order of this.orders()) {
      const createdAt = typeof order.createdAt === 'string' ? order.createdAt : '';
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    const days = Array.from(map.keys()).sort();
    return {
      days,
      labels: days.map(d => formatShortDate(d)),
      counts: days.map(d => map.get(d) ?? 0),
    };
  });

  protected readonly ordersByDayByStatus = computed(() => {
    const statusKeys: StatusKey[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unknown'];
    const dayMap = new Map<string, Record<StatusKey, number>>();
    for (const order of this.orders()) {
      const createdAt = typeof order.createdAt === 'string' ? order.createdAt : '';
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      const raw = (order.status || '').toLowerCase();
      const key: StatusKey =
        raw === 'pending' || raw === 'processing' || raw === 'shipped' || raw === 'delivered' || raw === 'cancelled'
          ? (raw as StatusKey)
          : 'unknown';
      const row = dayMap.get(day) ?? ({} as Record<StatusKey, number>);
      statusKeys.forEach(k => { if (!(k in row)) row[k] = 0; });
      row[key] = (row[key] ?? 0) + 1;
      dayMap.set(day, row);
    }
    const days = Array.from(dayMap.keys()).sort();
    const usedStatuses = statusKeys.filter(k => days.some(d => (dayMap.get(d)?.[k] ?? 0) > 0));
    return {
      days,
      labels: days.map(d => formatShortDate(d)),
      series: usedStatuses.map(status => ({
        name: status,
        data: days.map(d => dayMap.get(d)?.[status] ?? 0),
      })),
    };
  });

  protected readonly revenueByStatus = computed(() => {
    const map = new Map<StatusKey, number>();
    const statusKeys: StatusKey[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'unknown'];
    statusKeys.forEach(k => map.set(k, 0));
    for (const order of this.orders()) {
      const raw = (order.status || '').toLowerCase();
      const key: StatusKey =
        raw === 'pending' || raw === 'processing' || raw === 'shipped' || raw === 'delivered' || raw === 'cancelled'
          ? (raw as StatusKey)
          : 'unknown';
      const amount = Number(order.totalAmount) || 0;
      map.set(key, (map.get(key) ?? 0) + amount);
    }
    return statusKeys
      .filter(k => (map.get(k) ?? 0) > 0)
      .map(k => ({ status: k, revenue: map.get(k) ?? 0 }));
  });

  protected readonly totalProducts = computed(() => this.products().length);
  protected readonly totalInventoryValue = computed(() =>
    this.products().reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) ?? 0), 0)
  );
  protected readonly categoryStats = computed(() => {
    const map = new Map<string, number>();
    for (const p of this.products()) {
      const cat = p.category?.trim() || 'Uncategorized';
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return entries.map(([category, count]) => ({ category, count }));
  });

  protected readonly categoryStatsWithValue = computed(() => {
    const countMap = new Map<string, number>();
    const valueMap = new Map<string, number>();
    for (const p of this.products()) {
      const cat = p.category?.trim() || 'Uncategorized';
      countMap.set(cat, (countMap.get(cat) ?? 0) + 1);
      const value = (Number(p.price) || 0) * (Number(p.stock) ?? 0);
      valueMap.set(cat, (valueMap.get(cat) ?? 0) + value);
    }
    const cats = Array.from(countMap.keys()).sort();
    return cats.map(category => ({
      category,
      count: countMap.get(category) ?? 0,
      value: valueMap.get(category) ?? 0,
    }));
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

  protected readonly statusGridOptions: GridOptions<StatusStat> = {
    theme: adminGridTheme,
    animateRows: true,
    rowHeight: 40,
    headerHeight: 40,
    suppressCellFocus: true,
  };

  protected readonly statusDefaultColDef: ColDef<StatusStat> = {
    sortable: true,
    resizable: true,
  };

  protected readonly statusColumnDefs: ColDef<StatusStat>[] = [
    { field: 'label', headerName: 'Status', flex: 1, minWidth: 120 },
    {
      field: 'count',
      headerName: 'Count',
      width: 120,
      type: 'rightAligned',
      valueFormatter: p => (p.value != null ? String(p.value) : ''),
    },
    {
      field: 'percent',
      headerName: '% of Total',
      width: 120,
      type: 'rightAligned',
      valueFormatter: p => (p.value != null ? this.formatPercent(p.value) : ''),
    },
  ];

  protected readonly statusGetRowId = (params: GetRowIdParams<StatusStat>): string =>
    params.data?.status ?? '';

  protected readonly totalUsers = computed(() => this.users().length);
  protected readonly usersWithPhone = computed(() =>
    this.users().filter(u => (u.phone ?? '').trim() !== '').length
  );
  protected readonly roleStats = computed(() => {
    const map = new Map<string, number>();
    for (const u of this.users()) {
      const role = (u.role ?? 'user').trim() || 'user';
      map.set(role, (map.get(role) ?? 0) + 1);
    }
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    return entries.map(([role, count]) => ({ role, count }));
  });
  protected readonly usersByDay = computed(() => {
    const map = new Map<string, number>();
    for (const u of this.users()) {
      const createdAt = typeof u.createdAt === 'string' ? u.createdAt : '';
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    const days = Array.from(map.keys()).sort();
    return {
      days,
      labels: days.map(d => formatShortDate(d)),
      counts: days.map(d => map.get(d) ?? 0),
    };
  });

  protected readonly usersByDayByRole = computed(() => {
    const roleSet = new Set<string>();
    const dayRoleMap = new Map<string, Map<string, number>>();
    for (const u of this.users()) {
      const createdAt = typeof u.createdAt === 'string' ? u.createdAt : '';
      if (!createdAt) continue;
      const day = createdAt.slice(0, 10);
      const role = (u.role ?? 'user').trim() || 'user';
      roleSet.add(role);
      const inner = dayRoleMap.get(day) ?? new Map<string, number>();
      inner.set(role, (inner.get(role) ?? 0) + 1);
      dayRoleMap.set(day, inner);
    }
    const days = Array.from(dayRoleMap.keys()).sort();
    const roles = Array.from(roleSet).sort();
    return {
      days,
      labels: days.map(d => formatShortDate(d)),
      roles,
      series: roles.map(role => ({
        name: role,
        data: days.map(d => dayRoleMap.get(d)?.get(role) ?? 0),
      })),
    };
  });

  protected readonly usersCumulativeByDay = computed(() => {
    const usersByDay = this.usersByDay();
    let cum = 0;
    return usersByDay.counts.map(c => { cum += c; return cum; });
  });

  protected readonly usersGridOptions: GridOptions<User> = {
    theme: adminGridTheme,
    animateRows: true,
    rowHeight: 40,
    headerHeight: 40,
    suppressCellFocus: true,
  };

  protected readonly usersDefaultColDef: ColDef<User> = {
    sortable: true,
    resizable: true,
  };

  protected readonly usersColumnDefs: ColDef<User>[] = [
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
    {
      field: 'role',
      headerName: 'Role',
      width: 100,
      valueGetter: p => (p.data?.role ?? '—').trim() || '—',
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      width: 120,
      valueGetter: p => (p.data?.firstName ?? '').trim() || '—',
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      width: 120,
      valueGetter: p => (p.data?.lastName ?? '').trim() || '—',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 120,
      valueGetter: p => (p.data?.phone ?? '').trim() || '—',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 110,
      valueFormatter: p => {
        const v = p.value ?? p.data?.createdAt;
        return typeof v === 'string' && v.length >= 10 ? formatShortDate(v.slice(0, 10)) : '—';
      },
    },
  ];

  protected readonly usersGetRowId = (params: GetRowIdParams<User>): string =>
    params.data?.id ?? params.data?._id ?? '';

  protected readonly productsGridOptions: GridOptions<Product> = {
    theme: adminGridTheme,
    animateRows: true,
    rowHeight: 40,
    headerHeight: 40,
    suppressCellFocus: true,
  };

  protected readonly productsDefaultColDef: ColDef<Product> = {
    sortable: true,
    resizable: true,
  };

  protected readonly productsColumnDefs: ColDef<Product>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,
      minWidth: 120,
      valueGetter: p => p.data?.category?.trim() || '—',
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'rightAligned',
      valueFormatter: p => (p.value != null ? this.formatCurrency(Number(p.value)) : ''),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      type: 'rightAligned',
      valueGetter: p => p.data?.stock ?? 0,
      valueFormatter: p => (p.value != null ? String(p.value) : ''),
    },
  ];

  protected readonly productsGetRowId = (params: GetRowIdParams<Product>): string =>
    params.data?.id ?? params.data?._id ?? '';

  private orderCharts: echarts.ECharts[] = [];
  private productCharts: echarts.ECharts[] = [];
  private userCharts: echarts.ECharts[] = [];
  private resizeObserver?: ResizeObserver;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {
    effect(() => this.renderCharts());
  }

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.orderCharts.forEach(c => c?.dispose());
    this.productCharts.forEach(c => c?.dispose());
    this.userCharts.forEach(c => c?.dispose());
  }

  setActiveTab(tab: AnalyticsTab): void {
    this.activeTab.set(tab);
    if (tab === 'products' && this.products().length === 0 && !this.productsLoading()) {
      this.refreshProducts();
    }
    if (tab === 'users' && this.users().length === 0 && !this.usersLoading()) {
      this.refreshUsers();
    }
    setTimeout(() => {
      this.orderCharts.forEach(c => c?.resize());
      this.productCharts.forEach(c => c?.resize());
      this.userCharts.forEach(c => c?.resize());
    }, 80);
  }

  refresh(): void {
    if (this.activeTab() === 'orders') this.refreshOrders();
    else if (this.activeTab() === 'products') this.refreshProducts();
    else this.refreshUsers();
  }

  refreshOrders(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getOrders(this.apiBaseUrl(), 'all').subscribe({
      next: (items) => this.orders.set(items),
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load orders'),
      complete: () => this.loading.set(false),
    });
  }

  refreshProducts(): void {
    this.productsError.set('');
    this.productsLoading.set(true);
    this.api.getProducts(this.apiBaseUrl()).subscribe({
      next: (items) => this.products.set(items),
      error: (e: unknown) =>
        this.productsError.set(this.extractErrorMessage(e) || 'Failed to load products'),
      complete: () => this.productsLoading.set(false),
    });
  }

  refreshUsers(): void {
    this.usersError.set('');
    this.usersLoading.set(true);
    this.api.getUsers(this.apiBaseUrl()).subscribe({
      next: (items) => this.users.set(items),
      error: (e: unknown) =>
        this.usersError.set(this.extractErrorMessage(e) || 'Failed to load users'),
      complete: () => this.usersLoading.set(false),
    });
  }

  private renderCharts(): void {
    const orderEls = [
      this.ordersBarChartEl?.nativeElement,
      this.ordersLineChartEl?.nativeElement,
      this.ordersScatterChartEl?.nativeElement,
      this.ordersPieChartEl?.nativeElement,
    ];
    const productEls = [
      this.productsBarChartEl?.nativeElement,
      this.productsLineChartEl?.nativeElement,
      this.productsScatterChartEl?.nativeElement,
      this.productsPieChartEl?.nativeElement,
    ];
    const userEls = [
      this.usersBarChartEl?.nativeElement,
      this.usersLineChartEl?.nativeElement,
      this.usersScatterChartEl?.nativeElement,
      this.usersPieChartEl?.nativeElement,
    ];
    if (this.orderCharts.length === 0 && orderEls[0]) {
      orderEls.forEach((el, i) => {
        if (el) {
          const chart = echarts.init(el);
          this.orderCharts[i] = chart;
        }
      });
      productEls.forEach((el, i) => {
        if (el) {
          const chart = echarts.init(el);
          this.productCharts[i] = chart;
        }
      });
      userEls.forEach((el, i) => {
        if (el) {
          const chart = echarts.init(el);
          this.userCharts[i] = chart;
        }
      });
      if (!this.resizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          this.orderCharts.forEach(c => c?.resize());
          this.productCharts.forEach(c => c?.resize());
          this.userCharts.forEach(c => c?.resize());
        });
        [...orderEls, ...productEls, ...userEls].filter(Boolean).forEach(el => this.resizeObserver!.observe(el!));
      }
    }

    const palette = { text: '#3C4043', border: '#DADCE0', accent: '#4285F4', grid: '#F1F3F4' };
    const hasOrders = this.totalOrders() > 0;
    const revenue = this.revenueByDay();
    const ordersByDay = this.ordersByDay();
    const ordersByDayByStatus = this.ordersByDayByStatus();
    const revenueByStatus = this.revenueByStatus();
    const revenueByStatusPie = revenueByStatus.map((r, i) => ({
      name: r.status,
      value: r.revenue,
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
    }));
    const ordersScatterData = revenue.days.map((_, i) => [ordersByDay.counts[i], revenue.totals[i]]);
    const orderStackedSeries = ordersByDayByStatus.series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      stack: 'orders',
      data: s.data,
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
    }));

    if (this.orderCharts[0]) {
      this.orderCharts[0].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Orders by Day & Status (Bar)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'axis' },
        legend: { top: 24, type: 'scroll', textStyle: { fontSize: 10 } },
        grid: { left: 40, right: 16, top: 48, bottom: 28 },
        xAxis: { type: 'category', data: ordersByDayByStatus.labels, axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: palette.text, fontSize: 10 } },
        series: hasOrders && orderStackedSeries.length ? orderStackedSeries : [{ type: 'bar', data: [], itemStyle: { color: palette.accent } }],
      }, { notMerge: true });
    }
    if (this.orderCharts[1]) {
      this.orderCharts[1].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Orders Count & Revenue (Line)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'axis' },
        legend: { top: 24, data: ['Orders', 'Revenue'], textStyle: { fontSize: 10 } },
        grid: { left: 44, right: 44, top: 48, bottom: 28 },
        xAxis: { type: 'category', data: revenue.labels, axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: [
          { type: 'value', name: 'Orders', position: 'left', axisLabel: { color: palette.text, fontSize: 10 } },
          { type: 'value', name: 'Revenue', position: 'right', axisLabel: { color: palette.text, fontSize: 10 } },
        ],
        series: [
          { name: 'Orders', type: 'line', data: hasOrders ? ordersByDay.counts : [], yAxisIndex: 0, lineStyle: { color: CHART_COLORS[0] }, symbol: 'circle', symbolSize: 6 },
          { name: 'Revenue', type: 'line', data: hasOrders ? revenue.totals : [], yAxisIndex: 1, lineStyle: { color: CHART_COLORS[1] }, symbol: 'circle', symbolSize: 6 },
        ],
      }, { notMerge: true });
    }
    if (this.orderCharts[2]) {
      this.orderCharts[2].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Orders vs Revenue (Scatter)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'item' },
        grid: { left: 40, right: 16, top: 28, bottom: 28 },
        xAxis: { type: 'value', name: 'Orders', axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: { type: 'value', name: 'Revenue', axisLabel: { color: palette.text, fontSize: 10 } },
        series: [{ type: 'scatter', data: hasOrders ? ordersScatterData : [], symbolSize: 10, itemStyle: { color: palette.accent } }],
      }, { notMerge: true });
    }
    if (this.orderCharts[3]) {
      this.orderCharts[3].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Revenue by Status (Pie)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'item' },
        series: [{ type: 'pie', radius: '65%', center: ['50%', '55%'], data: hasOrders && revenueByStatusPie.length ? revenueByStatusPie : [{ name: 'No data', value: 1 }], label: { fontSize: 10 } }],
      }, { notMerge: true });
    }

    const hasProducts = this.totalProducts() > 0;
    const categoryWithValue = this.categoryStatsWithValue();
    const categoryLabels = categoryWithValue.map(c => c.category);
    const categoryCounts = categoryWithValue.map(c => c.count);
    const categoryValues = categoryWithValue.map(c => c.value);
    const productsScatterData = this.products().map(p => [Number(p.price) || 0, p.stock ?? 0]);
    const productPieValueData = categoryWithValue.map((c, i) => ({ name: c.category, value: c.value, itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] } }));

    if (this.productCharts[0]) {
      this.productCharts[0].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Count & Value by Category (Bar)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'axis' },
        legend: { top: 24, data: ['Count', 'Inventory Value'], textStyle: { fontSize: 10 } },
        grid: { left: 44, right: 44, top: 48, bottom: 40 },
        xAxis: { type: 'category', data: categoryLabels, axisLabel: { color: palette.text, fontSize: 10, rotate: 25 } },
        yAxis: [
          { type: 'value', name: 'Count', position: 'left', axisLabel: { color: palette.text, fontSize: 10 } },
          { type: 'value', name: 'Value', position: 'right', axisLabel: { color: palette.text, fontSize: 10 } },
        ],
        series: [
          { name: 'Count', type: 'bar', data: categoryCounts, yAxisIndex: 0, itemStyle: { color: CHART_COLORS[0] } },
          { name: 'Inventory Value', type: 'bar', data: categoryValues, yAxisIndex: 1, itemStyle: { color: CHART_COLORS[1] } },
        ],
      }, { notMerge: true });
    }
    if (this.productCharts[1]) {
      this.productCharts[1].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Count & Value by Category (Line)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'axis' },
        legend: { top: 24, data: ['Count', 'Inventory Value'], textStyle: { fontSize: 10 } },
        grid: { left: 44, right: 44, top: 48, bottom: 40 },
        xAxis: { type: 'category', data: categoryLabels, axisLabel: { color: palette.text, fontSize: 10, rotate: 25 } },
        yAxis: [
          { type: 'value', name: 'Count', position: 'left', axisLabel: { color: palette.text, fontSize: 10 } },
          { type: 'value', name: 'Value', position: 'right', axisLabel: { color: palette.text, fontSize: 10 } },
        ],
        series: [
          { name: 'Count', type: 'line', data: categoryCounts, yAxisIndex: 0, lineStyle: { color: CHART_COLORS[0] }, symbol: 'circle', symbolSize: 6 },
          { name: 'Inventory Value', type: 'line', data: categoryValues, yAxisIndex: 1, lineStyle: { color: CHART_COLORS[1] }, symbol: 'circle', symbolSize: 6 },
        ],
      }, { notMerge: true });
    }
    if (this.productCharts[2]) {
      this.productCharts[2].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Price vs Stock (Scatter)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'item' },
        grid: { left: 44, right: 16, top: 28, bottom: 28 },
        xAxis: { type: 'value', name: 'Price', axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: { type: 'value', name: 'Stock', axisLabel: { color: palette.text, fontSize: 10 } },
        series: [{ type: 'scatter', data: hasProducts ? productsScatterData : [], symbolSize: 8, itemStyle: { color: palette.accent } }],
      }, { notMerge: true });
    }
    if (this.productCharts[3]) {
      this.productCharts[3].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Inventory Value by Category (Pie)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'item' },
        series: [{ type: 'pie', radius: '65%', center: ['50%', '55%'], data: hasProducts && productPieValueData.length ? productPieValueData : [{ name: 'No data', value: 1 }], label: { fontSize: 10 } }],
      }, { notMerge: true });
    }

    const hasUsers = this.totalUsers() > 0;
    const usersByDay = this.usersByDay();
    const usersByDayByRole = this.usersByDayByRole();
    const usersCumulativeByDay = this.usersCumulativeByDay();
    const roles = this.roleStats();
    const usersScatterData = roles.map((r, i) => [i, r.count]);
    const userPieData = roles.map((r, i) => ({ name: r.role, value: r.count, itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] } }));
    const userStackedSeries = usersByDayByRole.series.map((s, i) => ({
      name: s.name,
      type: 'bar',
      stack: 'users',
      data: s.data,
      itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
    }));

    if (this.userCharts[0]) {
      this.userCharts[0].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Registrations by Day & Role (Bar)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'axis' },
        legend: { top: 24, type: 'scroll', textStyle: { fontSize: 10 } },
        grid: { left: 40, right: 16, top: 48, bottom: 28 },
        xAxis: { type: 'category', data: usersByDayByRole.labels, axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: { type: 'value', axisLabel: { color: palette.text, fontSize: 10 } },
        series: hasUsers && userStackedSeries.length ? userStackedSeries : [{ type: 'bar', data: [], itemStyle: { color: palette.accent } }],
      }, { notMerge: true });
    }
    if (this.userCharts[1]) {
      this.userCharts[1].setOption({
        backgroundColor: 'transparent',
        title: { text: 'New Users & Cumulative (Line)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'axis' },
        legend: { top: 24, data: ['New', 'Cumulative'], textStyle: { fontSize: 10 } },
        grid: { left: 44, right: 16, top: 48, bottom: 28 },
        xAxis: { type: 'category', data: usersByDay.labels, axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: [
          { type: 'value', name: 'New', position: 'left', axisLabel: { color: palette.text, fontSize: 10 } },
          { type: 'value', name: 'Cumulative', position: 'right', axisLabel: { color: palette.text, fontSize: 10 } },
        ],
        series: [
          { name: 'New', type: 'line', data: hasUsers ? usersByDay.counts : [], yAxisIndex: 0, lineStyle: { color: CHART_COLORS[0] }, symbol: 'circle', symbolSize: 6 },
          { name: 'Cumulative', type: 'line', data: hasUsers ? usersCumulativeByDay : [], yAxisIndex: 1, lineStyle: { color: CHART_COLORS[1] }, symbol: 'circle', symbolSize: 6 },
        ],
      }, { notMerge: true });
    }
    if (this.userCharts[2]) {
      this.userCharts[2].setOption({
        backgroundColor: 'transparent',
        title: { text: 'Role Index vs Count (Scatter)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: {
          trigger: 'item',
          formatter: (p: unknown) => {
            const params = p as { data?: number[] };
            const idx = params.data?.[0];
            const r = typeof idx === 'number' && roles[idx] ? roles[idx] : null;
            return r ? `${r.role}: ${r.count}` : '';
          },
        },
        grid: { left: 40, right: 16, top: 28, bottom: 28 },
        xAxis: { type: 'value', name: 'Role', axisLabel: { color: palette.text, fontSize: 10 } },
        yAxis: { type: 'value', name: 'Count', axisLabel: { color: palette.text, fontSize: 10 } },
        series: [{ type: 'scatter', data: hasUsers ? usersScatterData : [], symbolSize: 12, itemStyle: { color: palette.accent } }],
      }, { notMerge: true });
    }
    if (this.userCharts[3]) {
      this.userCharts[3].setOption({
        backgroundColor: 'transparent',
        title: { text: 'By Role (Pie)', left: 'center', top: 2, textStyle: { color: palette.text, fontSize: 12 } },
        tooltip: { trigger: 'item' },
        series: [{ type: 'pie', radius: '65%', center: ['50%', '55%'], data: hasUsers && userPieData.length ? userPieData : [{ name: 'No data', value: 1 }], label: { fontSize: 10 } }],
      }, { notMerge: true });
    }
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

