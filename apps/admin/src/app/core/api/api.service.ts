import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type LoginRequest = {
  emailOrPhone: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  email: string;
  adminSecret: string;
  token: string;
  role?: string;
};

export type Product = {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  modelKey?: string;
  category?: string;
  stock?: number;
};

export type Order = {
  id: string;
  _id?: string;
  userId: unknown;
  status: string;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  items?: unknown[];
};

export type User = {
  id: string;
  _id?: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
};

export type CreateUserRequest = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
};

export type ImportProductsResult = {
  createdCount: number;
  createdIds: string[];
  errors: unknown[];
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  login(apiBaseUrl: string, payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${apiBaseUrl}/users/login`, payload);
  }

  getProducts(apiBaseUrl: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${apiBaseUrl}/products`);
  }

  createProduct(apiBaseUrl: string, payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${apiBaseUrl}/products`, payload);
  }

  deleteProduct(apiBaseUrl: string, productId: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${apiBaseUrl}/products/${productId}`);
  }

  importProductsJson(apiBaseUrl: string, payload: unknown): Observable<ImportProductsResult> {
    return this.http.post<ImportProductsResult>(`${apiBaseUrl}/products/import/json`, payload);
  }

  getOrders(apiBaseUrl: string, status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${apiBaseUrl}/orders/admin/${encodeURIComponent(status)}`);
  }

  updateOrderStatus(apiBaseUrl: string, orderId: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${apiBaseUrl}/orders/${orderId}/status`, { status });
  }

  getUsers(apiBaseUrl: string): Observable<User[]> {
    return this.http.get<User[]>(`${apiBaseUrl}/users`);
  }

  createUser(apiBaseUrl: string, payload: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${apiBaseUrl}/users/register`, payload);
  }
}

