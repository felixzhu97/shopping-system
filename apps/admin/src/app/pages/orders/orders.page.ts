import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';

import { ApiService, Order } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

type OrderRow = Order & { selectedStatus?: string };

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.page.html',
  styleUrl: './orders.page.scss',
})
export class OrdersPage implements OnInit {
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly status = signal<string>('all');
  protected readonly orders = signal<OrderRow[]>([]);

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);

  protected readonly statuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ] as const;

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
      next: (items) => {
        this.orders.set(items.map(o => ({ ...o, selectedStatus: o.status })));
      },
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load orders'),
      complete: () => this.loading.set(false),
    });
  }

  update(order: OrderRow): void {
    const nextStatus = order.selectedStatus ?? order.status;
    if (!nextStatus || nextStatus === order.status || this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    this.api.updateOrderStatus(this.apiBaseUrl(), order._id, nextStatus).subscribe({
      next: (updated) => {
        this.orders.set(
          this.orders().map(o =>
            o._id === updated._id ? { ...o, ...updated, selectedStatus: updated.status } : o
          )
        );
      },
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to update order');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  trackById(_: number, item: OrderRow): string {
    return item._id;
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

