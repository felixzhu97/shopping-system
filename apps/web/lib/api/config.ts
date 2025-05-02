import { ApiResponse } from 'shared';

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
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
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.proxyUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error(`url: ${url} status: ${response.status}`, data);
      throw new Error(data.message || '请求失败');
    }

    return { data, success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
