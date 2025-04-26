import { Product } from 'shared';
import { MOCK_PRODUCTS } from '../../mocks/products';
import { API_CONFIG, CATEGORY_MAPPING, fetchApi } from './config';

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
