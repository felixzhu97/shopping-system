import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GetRowIdParams, GridOptions } from 'ag-grid-community';

import { ApiService, User } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { adminGridTheme } from '../../core/ag-grid/ag-grid-theme';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './users.page.html',
  styleUrl: './users.page.scss',
})
export class UsersPage implements OnInit {
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly users = signal<User[]>([]);
  protected readonly search = signal<string>('');

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);
  protected readonly filteredUsers = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u => {
      const text = `${u.email ?? ''} ${u.phone ?? ''} ${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  });

  protected readonly defaultColDef: ColDef<User> = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 140,
  };

  protected readonly gridOptions: GridOptions<User> = {
    theme: adminGridTheme,
    animateRows: true,
    rowSelection: { mode: 'singleRow' },
    rowHeight: 44,
    headerHeight: 44,
  };

  protected readonly columnDefs: ColDef<User>[] = [
    { field: 'email', headerName: 'Email', minWidth: 240 },
    { field: 'role', headerName: 'Role', maxWidth: 140 },
    {
      headerName: 'Name',
      valueGetter: p => `${p.data?.firstName ?? ''} ${p.data?.lastName ?? ''}`.trim(),
      minWidth: 180,
    },
    { field: 'phone', headerName: 'Phone', minWidth: 160 },
    { field: 'createdAt', headerName: 'Created', minWidth: 200 },
  ];

  protected readonly getRowId = (params: GetRowIdParams<User>): string =>
    String((params.data as { id?: string; _id?: string } | undefined)?.id ?? (params.data as any)?._id ?? '');

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getUsers(this.apiBaseUrl()).subscribe({
      next: (items) => this.users.set(items),
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load users'),
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

