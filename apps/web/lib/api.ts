import { ApiResponse, Cart, Product } from 'shared';
import { MOCK_PRODUCTS } from '../mocks/products';

// 配置常量
const API_CONFIG = {
  baseUrl: '/api/proxy',
  productsUrl: '/products',
  cartUrl: '/cart',
  timeout: 5000, // 5秒超时
  maxRetries: 0 as number,
  retryDelay: 1000, // 1秒重试延迟
  cacheTime: 5 * 60 * 1000, // 5分钟缓存时间
} as const;

// 可变的配置项
let cacheTime = API_CONFIG.cacheTime;

// 类别名称映射表
const CATEGORY_MAPPING: Record<string, string> = {
  electronics: 'Electronics',
  clothing: 'Clothing',
  'home-kitchen': 'Home & Kitchen',
  books: 'Books',
} as const;

// 请求缓存
const requestCache = new Map<string, { data: any; timestamp: number }>();

// 请求拦截器
const requestInterceptors: ((config: RequestInit) => RequestInit)[] = [];
const responseInterceptors: ((response: Response) => Promise<Response>)[] = [];

// 添加请求拦截器
export function addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
  requestInterceptors.push(interceptor);
}

// 添加响应拦截器
export function addResponseInterceptor(interceptor: (response: Response) => Promise<Response>) {
  responseInterceptors.push(interceptor);
}

// 应用请求拦截器
function applyRequestInterceptors(config: RequestInit): RequestInit {
  return requestInterceptors.reduce((acc, interceptor) => interceptor(acc), config);
}

// 应用响应拦截器
async function applyResponseInterceptors(response: Response): Promise<Response> {
  for (const interceptor of responseInterceptors) {
    response = await interceptor(response);
  }
  return response;
}

// 通用请求函数
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = API_CONFIG.maxRetries
): Promise<ApiResponse<T>> {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cachedData = requestCache.get(cacheKey);

  // 检查缓存
  if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
    console.log('使用缓存数据:', url);
    return { data: cachedData.data, success: true };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    // 应用请求拦截器
    const finalOptions = applyRequestInterceptors({
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });

    const response = await fetch(url, finalOptions);
    clearTimeout(timeoutId);

    // 应用响应拦截器
    const processedResponse = await applyResponseInterceptors(response);

    if (!processedResponse.ok) {
      throw new Error(`HTTP error! status: ${processedResponse.status}`);
    }

    const data = await processedResponse.json();

    // 缓存响应数据
    if (options.method === 'GET') {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
    }

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

// 清除缓存
export function clearCache() {
  requestCache.clear();
}

// 设置缓存时间
export function setCacheTime(ms: number) {
  cacheTime = ms;
}
