import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import type { AlignedGrid, ColDef, GetRowIdParams, GridOptions, ICellRendererParams } from 'ag-grid-community';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

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
  private readonly router = inject(Router);

  protected readonly modelAssets = MODEL_ASSETS;

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly products = signal<Product[]>([]);
  protected readonly search = signal<string>('');

  protected readonly importFile = signal<File | null>(null);
  protected readonly importing = signal<boolean>(false);
  protected readonly toastMessage = signal<string>('');
  protected readonly createModalOpen = signal<boolean>(false);
  protected readonly importModalOpen = signal<boolean>(false);
  private toastTimer: number | undefined;

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

  protected openCreateModal(): void {
    this.error.set('');
    this.toastMessage.set('');
    this.createModalOpen.set(true);
  }

  protected closeCreateModal(): void {
    this.createModalOpen.set(false);
  }

  protected openImportModal(): void {
    this.error.set('');
    this.toastMessage.set('');
    this.importModalOpen.set(true);
  }

  protected closeImportModal(): void {
    this.importModalOpen.set(false);
    this.importFile.set(null);
  }

  protected signOut(): void {
    this.auth.clearSession();
    void this.router.navigate(['/login']);
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getProducts(this.apiBaseUrl()).subscribe({
      next: (items) => this.products.set(items),
      error: (e: unknown) => this.error.set(this.formatErrorMessage(e) || 'Failed to load products'),
      complete: () => this.loading.set(false),
    });
  }

  create(): void {
    if (this.form.invalid || this.loading()) return;
    if (!this.ensureAdminSecret()) return;
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
        this.closeCreateModal();
        this.showSuccessToast('Product created successfully');
      },
      error: (e: unknown) => {
        this.error.set(this.formatErrorMessage(e) || 'Failed to create product');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  remove(productId: string): void {
    if (!productId || this.loading()) return;
    if (!this.ensureAdminSecret()) return;
    this.error.set('');
    this.loading.set(true);
    this.api.deleteProduct(this.apiBaseUrl(), productId).subscribe({
      next: () => {
        this.products.set(this.products().filter(p => this.getId(p) !== productId));
        this.showSuccessToast('Product deleted successfully');
      },
      error: (e: unknown) => {
        this.error.set(this.formatErrorMessage(e) || 'Failed to delete product');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  protected setImportFile(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.importFile.set(file);
    this.toastMessage.set('');
  }

  protected importProducts(): void {
    const file = this.importFile();
    if (!file || this.loading() || this.importing()) return;
    if (!this.ensureAdminSecret()) return;

    this.error.set('');
    this.toastMessage.set('');
    this.importing.set(true);

    this.readProductsFromFile(file)
      .then((products) => {
        return new Promise<void>((resolve) => {
          this.api.importProductsJson(this.apiBaseUrl(), products).subscribe({
            next: (result) => {
              const errorCount = Array.isArray(result.errors) ? result.errors.length : 0;
              this.showSuccessToast(
                `Imported ${result.createdCount} products` + (errorCount ? ` (${errorCount} errors)` : '')
              );
              this.refresh();
              this.closeImportModal();
              resolve();
            },
            error: (e: unknown) => {
              this.error.set(this.formatErrorMessage(e) || 'Failed to import products');
              resolve();
            },
          });
        });
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Failed to parse import file';
        this.error.set(msg);
      })
      .finally(() => this.importing.set(false));
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

  private formatErrorMessage(e: unknown): string {
    const raw = this.extractErrorMessage(e);
    if (!raw) return '';
    if (raw === 'Invalid admin secret') return 'Invalid admin secret. Please sign in again.';
    if (raw === 'Missing admin-secret header') return 'Admin secret is missing. Please sign in again.';
    return raw;
  }

  protected closeToast(): void {
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = undefined;
    this.toastMessage.set('');
  }

  private showSuccessToast(message: string): void {
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastTimer = window.setTimeout(() => {
      this.toastTimer = undefined;
      this.toastMessage.set('');
    }, 3500);
  }

  private ensureAdminSecret(): boolean {
    if (this.auth.adminSecret) return true;
    this.error.set('Admin secret is missing. Please sign in again.');
    return false;
  }

  private normalizeKey(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private pickValue(row: Record<string, unknown>, keys: string[]): string {
    const normalizedRow: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      normalizedRow[this.normalizeKey(k)] = v;
    }
    for (const k of keys) {
      const v = normalizedRow[this.normalizeKey(k)];
      if (v === undefined || v === null) continue;
      const s = String(v).trim();
      if (s) return s;
    }
    return '';
  }

  private parseNumber(value: string): number | null {
    const v = value.trim();
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  private parseInteger(value: string): number | null {
    const v = value.trim();
    if (!v) return null;
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  }

  private async readFileText(file: File): Promise<string> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.readAsText(file);
    });
  }

  private async readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = () => {
        const result = reader.result;
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error('Failed to read file as ArrayBuffer'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private async readProductsFromFile(file: File): Promise<Array<Partial<Product>>> {
    const name = file.name.toLowerCase();

    if (name.endsWith('.json')) {
      const text = await this.readFileText(file);
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) return parsed as Array<Partial<Product>>;
      if (parsed && typeof parsed === 'object' && Array.isArray((parsed as any).products)) {
        return (parsed as any).products as Array<Partial<Product>>;
      }
      throw new Error('Invalid JSON file format');
    }

    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const buf = await this.readFileArrayBuffer(file);
      const wb = XLSX.read(buf, { type: 'array' });
      const firstSheetName = wb.SheetNames[0];
      if (!firstSheetName) throw new Error('Excel workbook has no sheets');
      const sheet = wb.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      return this.mapRowsToProducts(rows);
    }

    if (name.endsWith('.csv')) {
      const text = await this.readFileText(file);
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (parsed.errors?.length) {
        throw new Error(parsed.errors[0]?.message || 'Failed to parse CSV');
      }
      return this.mapRowsToProducts(parsed.data ?? []);
    }

    throw new Error('Unsupported file type. Please use CSV, Excel, or JSON.');
  }

  private mapRowsToProducts(rows: Array<Record<string, unknown>>): Array<Partial<Product>> {
    const products: Array<Partial<Product>> = [];

    for (const row of rows) {
      const name = this.pickValue(row, ['name', 'productName', 'product']);
      const description = this.pickValue(row, ['description', 'desc']);
      const image = this.pickValue(row, ['image', 'imageUrl', 'imageURL', 'imageLink']);
      const category = this.pickValue(row, ['category']);
      const modelKey = this.pickValue(row, ['modelKey', 'model_key']);
      const priceRaw = this.pickValue(row, ['price']);
      const stockRaw = this.pickValue(row, ['stock']);

      const price = this.parseNumber(priceRaw);
      const stock = this.parseInteger(stockRaw);

      if (!name || !description || !image || !category || price === null || stock === null) {
        continue;
      }

      products.push({
        name,
        description,
        image,
        category,
        modelKey: modelKey || undefined,
        price,
        stock,
      });
    }

    if (products.length === 0) {
      throw new Error('No valid rows found in import file');
    }

    return products;
  }
}

