import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import type { AlignedGrid, ColDef, GetRowIdParams, GridOptions, ICellRendererParams } from 'ag-grid-community';

import { ApiService, Product } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { adminGridTheme } from '../../core/ag-grid/ag-grid-theme';
import { MODEL_ASSETS } from '../../core/three/model-assets';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './products.page.html',
  styleUrl: './products.page.scss',
})
export class ProductsPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly modelAssets = MODEL_ASSETS;

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly products = signal<Product[]>([]);
  protected readonly search = signal<string>('');

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);
  protected readonly filteredProducts = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter(p => {
      const text = `${p.name ?? ''} ${p.category ?? ''} ${p.description ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  });

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: [''],
    modelKey: [''],
    stock: [0, [Validators.min(0)]],
  });

  protected readonly defaultColDef: ColDef<Product> = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
    cellStyle: {
      display: 'flex',
      alignItems: 'center',
    },
  };

  protected readonly gridOptions: GridOptions<Product> = {
    theme: adminGridTheme,
    animateRows: true,
    rowSelection: { mode: 'singleRow' },
    rowHeight: 44,
    headerHeight: 44,
  };

  protected readonly columnDefs: ColDef<Product>[] = [
    { field: 'name', headerName: 'Name', minWidth: 220 },
    { field: 'price', headerName: 'Price', maxWidth: 140,  valueFormatter: p => String(p.value ?? '') },
    { field: 'category', headerName: 'Category', minWidth: 180 },
    { field: 'modelKey', headerName: 'Model Key', minWidth: 240 },
    { field: 'stock', headerName: 'Stock', maxWidth: 140,  valueFormatter: p => String(p.value ?? '') },
    {
      headerName: '',
      minWidth: 72,
      maxWidth: 72,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      cellClass: 'sf-grid-actions-cell',
      cellRenderer: (params: ICellRendererParams<Product>) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sf-grid-action';
        button.title = 'Delete';

        const icon = document.createElement('i');
        icon.className = 'bi bi-trash';
        button.appendChild(icon);

        button.addEventListener('click', () => this.remove(this.getId(params.data ?? {})));
        return button;
      },
    },
  ];

  protected readonly getRowId = (params: GetRowIdParams<Product>): string =>
    this.getId((params.data ?? {}) as { id?: string; _id?: string });

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
      modelKey: value.modelKey || undefined,
      stock: value.stock ?? undefined,
    }).subscribe({
      next: (created) => {
        this.products.set([created, ...this.products()]);
        this.form.reset({ name: '', price: 0, category: '', modelKey: '', stock: 0 });
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
      next: () => this.products.set(this.products().filter(p => this.getId(p) !== productId)),
      error: (e: unknown) => {
        this.error.set(this.extractErrorMessage(e) || 'Failed to delete product');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected getId(value: { id?: string; _id?: string }): string {
    return value.id || value._id || '';
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

