import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { CellValueChangedEvent, ColDef, GetRowIdParams, GridOptions } from 'ag-grid-community';

import { ApiService, Order } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { adminGridTheme } from '../../core/ag-grid/ag-grid-theme';

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.scss',
})
export class OrdersPage implements OnInit {
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly status = signal<string>('all');
  protected readonly orders = signal<Order[]>([]);
  protected readonly search = signal<string>('');

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);
  protected readonly filteredOrders = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.orders();
    return this.orders().filter(o => {
      const id = this.getId(o);
      const user = typeof o.userId === 'string' ? o.userId : JSON.stringify(o.userId ?? '');
      const text = `${id} ${o.status ?? ''} ${user}`.toLowerCase();
      return text.includes(q);
    });
  });

  protected readonly statuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ] as const;

  protected readonly defaultColDef: ColDef<Order> = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 140,
  };

  protected readonly gridOptions: GridOptions<Order> = {
    theme: adminGridTheme,
    animateRows: true,
    stopEditingWhenCellsLoseFocus: true,
    rowHeight: 44,
    headerHeight: 44,
  };

  protected readonly columnDefs: ColDef<Order>[] = [
    { headerName: 'Id', valueGetter: p => this.getId(p.data ?? {}), minWidth: 220 },
    {
      headerName: 'User',
      valueGetter: p => {
        const v = p.data?.userId;
        return typeof v === 'string' ? v : JSON.stringify(v ?? '');
      },
      minWidth: 220,
    },
    { field: 'totalAmount', headerName: 'Total', maxWidth: 160,  valueFormatter: p => String(p.value ?? '') },
    {
      field: 'status',
      headerName: 'Status',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: [...this.statuses] },
      maxWidth: 180,
    },
    { field: 'createdAt', headerName: 'Created', minWidth: 200 },
  ];

  protected readonly getRowId = (params: GetRowIdParams<Order>): string =>
    this.getId((params.data ?? {}) as { id?: string; _id?: string });

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  setStatus(value: string): void {
    this.status.set(value);
    this.refresh();
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getOrders(this.apiBaseUrl(), this.status()).subscribe({
      next: (items) => this.orders.set(items),
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load orders'),
      complete: () => this.loading.set(false),
    });
  }

  protected getId(value: { id?: string; _id?: string }): string {
    return value.id || value._id || '';
  }

  protected onCellValueChanged(event: CellValueChangedEvent<Order>): void {
    if (event.colDef.field !== 'status') return;
    const nextStatus = String(event.newValue ?? '').trim();
    const prevStatus = String(event.oldValue ?? '').trim();
    if (!nextStatus || nextStatus === prevStatus) return;

    const orderId = this.getId(event.data ?? {});
    if (!orderId) return;

    this.error.set('');
    this.loading.set(true);
    this.api.updateOrderStatus(this.apiBaseUrl(), orderId, nextStatus).subscribe({
      next: (updated) => {
        this.orders.set(this.orders().map(o => (this.getId(o) === this.getId(updated) ? updated : o)));
      },
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to update order');
        this.loading.set(false);
        event.node.setDataValue('status', prevStatus);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected setSearch(value: string): void {
    this.search.set(value);
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

