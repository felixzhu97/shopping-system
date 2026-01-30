import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ApiService, Product } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss',
})
export class ProductsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly products = signal<Product[]>([]);

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: [''],
    stock: [0, [Validators.min(0)]],
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getProducts(this.apiBaseUrl()).subscribe({
      next: (items) => this.products.set(items),
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load products'),
      complete: () => this.loading.set(false),
    });
  }

  create(): void {
    if (this.form.invalid || this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    const value = this.form.getRawValue();
    this.api.createProduct(this.apiBaseUrl(), {
      name: value.name,
      price: value.price,
      category: value.category || undefined,
      stock: value.stock ?? undefined,
    }).subscribe({
      next: (created) => {
        this.products.set([created, ...this.products()]);
        this.form.reset({ name: '', price: 0, category: '', stock: 0 });
      },
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to create product');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  remove(productId: string): void {
    if (!productId || this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    this.api.deleteProduct(this.apiBaseUrl(), productId).subscribe({
      next: () => this.products.set(this.products().filter(p => p._id !== productId)),
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to delete product');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  trackById(_: number, item: Product): string {
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

