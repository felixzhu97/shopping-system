import { ApiResponse, ErrorResponse } from 'types';
import { getTokenFromStore } from '../store/userStore';

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || '',
  proxyUrl: '/api/proxy',
  productsUrl: '/products',
  cartUrl: '/cart',
  usersUrl: '/users',
  orderUrl: '/orders',
} as const;

export const CATEGORY_MAPPING: Record<string, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books',
} as const;

export async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = getTokenFromStore();
    let headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.proxyUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const data = (await response.json()) as ErrorResponse;

      throw new Error(data.message || 'Request failed');
    }

    const data = await response.json();

    return { data, success: true };
  } catch (error) {
    console.error('fetchApi error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
