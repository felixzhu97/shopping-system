import { ApiResponse, Cart, Product } from 'shared';
import { MOCK_PRODUCTS } from '../mocks/products';

const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  proxyUrl: '/api/proxy',
  productsUrl: '/products',
  cartUrl: '/cart',
} as const;

const CATEGORY_MAPPING: Record<string, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books',
} as const;

async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.proxyUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error('请求失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

export async function getProducts(category?: string): Promise<Product[]> {
  const url = category
    ? `${API_CONFIG.productsUrl}?category=${encodeURIComponent(category)}`
    : `${API_CONFIG.productsUrl}`;

  const response = await fetchApi<Product[]>(url);

  if (!response.success || !response.data) {
    console.warn('使用模拟数据作为后备');
    return category
      ? MOCK_PRODUCTS.filter(p => p.category === CATEGORY_MAPPING[category])
      : MOCK_PRODUCTS;
  }

  return response.data;
}

export async function getProduct(id: string): Promise<Product> {
  if (id.startsWith('mock-')) {
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
    return mockProduct || MOCK_PRODUCTS[0];
  }

  const url = `${API_CONFIG.productsUrl}/${id}`;
  const response = await fetchApi<Product>(url);

  if (!response.success || !response.data) {
    console.warn('使用模拟数据作为后备');
    return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  }

  return response.data;
}

export async function getCart(userId: string): Promise<Cart> {
  const url = `${API_CONFIG.cartUrl}/${userId}`;
  const response = await fetchApi<Cart>(url);

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
  const url = `${API_CONFIG.cartUrl}/${userId}`;
  return fetchApi<Cart>(url, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItem(
  userId: string,
  productId: string,
  quantity: number
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}/item/${productId}`;
  return fetchApi<Cart>(url, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(
  userId: string,
  productId: string
): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}/item/${productId}`;
  return fetchApi<Cart>(url, {
    method: 'DELETE',
  });
}

export async function clearCart(userId: string): Promise<ApiResponse<Cart>> {
  const url = `${API_CONFIG.cartUrl}/${userId}`;
  return fetchApi<Cart>(url, {
    method: 'DELETE',
  });
}
