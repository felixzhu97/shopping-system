import { Product } from 'types';
import { MOCK_PRODUCTS } from '../../mocks/products';
import { API_CONFIG, CATEGORY_MAPPING, fetchApi } from './config';

export async function getProducts(category?: string): Promise<Product[]> {
  const url = category
    ? `${API_CONFIG.productsUrl}?category=${encodeURIComponent(category)}`
    : `${API_CONFIG.productsUrl}`;

  const response = await fetchApi<Product[]>(url);

  if (!response.success || !response.data) {
    console.warn('Falling back to mock products');
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
    console.warn('Falling back to mock products');
    return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  }

  return response.data;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map(v => v.trim())
    .filter(v => v.length >= 3);
}

function jaccard(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter += 1;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function fallbackRecommendations(productId: string, limit: number) {
  const seed = MOCK_PRODUCTS.find(p => p.id === productId);
  if (!seed) return MOCK_PRODUCTS.slice(0, limit);
  const seedTokens = tokenize(`${seed.name} ${seed.description} ${seed.category}`);
  return [...MOCK_PRODUCTS]
    .filter(p => p.id !== seed.id)
    .map(p => {
      const tokens = tokenize(`${p.name} ${p.description} ${p.category}`);
      const score = jaccard(seedTokens, tokens) + (p.category === seed.category ? 0.05 : 0);
      return { p, score };
    })
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(x => x.p);
}

export async function getRecommendations(productId: string, limit = 8): Promise<Product[]> {
  const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
  if (productId.startsWith('mock-')) return fallbackRecommendations(productId, safeLimit);

  const url = `/recommendations/${encodeURIComponent(productId)}?limit=${safeLimit}`;
  const response = await fetchApi<Product[]>(url);

  if (!response.success || !response.data) {
    console.warn('Falling back to mock products');
    return fallbackRecommendations(productId, safeLimit);
  }

  return response.data;
}
