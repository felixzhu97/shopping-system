import { Product, Cart, ApiResponse } from 'shared';
import { MOCK_PRODUCTS } from '../mocks/mocks';

// 配置常量
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  productsUrl: '/api/products',
  cartUrl: '/api/cart',
  timeout: 5000, // 5秒超时
  maxRetries: 0 as number,
  retryDelay: 1000, // 1秒重试延迟
} as const;

// 类别名称映射表
const CATEGORY_MAPPING: Record<string, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books',
} as const;

// 通用请求函数
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = API_CONFIG.maxRetries
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    clearTimeout(timeoutId);

    if (retries > 0) {
      console.warn(`请求失败，正在重试 (${retries} 次剩余):`, error);
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
      return fetchWithRetry(url, options, retries - 1);
    }

    console.error('请求最终失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

// 获取所有产品
export async function getProducts(category?: string): Promise<Product[]> {
  const url = category
    ? `${API_CONFIG.baseUrl}${API_CONFIG.productsUrl}?category=${encodeURIComponent(category)}`
    : `${API_CONFIG.baseUrl}${API_CONFIG.productsUrl}`;

  const response = await fetchWithRetry<Product[]>(url, {
    cache: 'no-store',
  });

  if (!response.success || !response.data) {
    console.warn('使用模拟数据作为后备');
    return category
      ? MOCK_PRODUCTS.filter(p => p.category === CATEGORY_MAPPING[category])
      : MOCK_PRODUCTS;
  }

  return response.data;
}

// 获取单个产品
export async function getProduct(id: string): Promise<Product> {
  if (id.startsWith('mock-')) {
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    return mockProduct || MOCK_PRODUCTS[0];
  }

  const url = `${API_CONFIG.baseUrl}${API_CONFIG.productsUrl}/${id}`;
  const response = await fetchWithRetry<Product>(url);

  if (!response.success || !response.data) {
    console.warn('使用模拟数据作为后备');
    return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  }

  return response.data;
}

// 购物车相关函数
export async function getCart(userId: string): Promise<Cart> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.cartUrl}/${userId}`;
  const response = await fetchWithRetry<Cart>(url);

  if (!response.success || !response.data) {
    return { items: [] };
  }

  return response.data;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.cartUrl}/${userId}`;
  return fetchWithRetry<Cart>(url, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.cartUrl}/${userId}/item/${productId}`;
  return fetchWithRetry<Cart>(url, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.cartUrl}/${userId}/item/${productId}`;
  return fetchWithRetry<Cart>(url, {
    method: 'DELETE',
  });
}

export async function clearCart(userId: string): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.cartUrl}/${userId}`;
  return fetchWithRetry<Cart>(url, {
    method: 'DELETE',
  });
}
