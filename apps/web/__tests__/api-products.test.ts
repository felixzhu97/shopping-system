import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetchApi
vi.mock('../lib/api/config', () => ({
  API_CONFIG: {
    productsUrl: '/api/products',
  },
  fetchApi: vi.fn(),
}));

describe('Products API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all products successfully', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Product 1',
        price: 100,
        image: 'product1.jpg',
        description: 'Description 1',
        category: 'Electronics',
        stock: 10,
      },
      {
        id: '2',
        name: 'Product 2',
        price: 200,
        image: 'product2.jpg',
        description: 'Description 2',
        category: 'Books',
        stock: 5,
      },
    ];

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockProducts,
    });

    const { getProducts } = await import('../lib/api/products');
    const result = await getProducts();

    expect(result).toEqual(mockProducts);
    expect(fetchApi).toHaveBeenCalledWith('/api/products');
  });

  it('should get products with category filter', async () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Electronics Product',
        price: 100,
        image: 'electronics.jpg',
        description: 'Electronics Description',
        category: 'Electronics',
        stock: 10,
      },
    ];

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockProducts,
    });

    const { getProducts } = await import('../lib/api/products');
    const result = await getProducts('Electronics');

    expect(result).toEqual(mockProducts);
    expect(fetchApi).toHaveBeenCalledWith('/api/products?category=Electronics');
  });

  it('should get product by ID successfully', async () => {
    const mockProduct = {
      id: '1',
      name: 'Product 1',
      price: 100,
      image: 'product1.jpg',
      description: 'Description 1',
      category: 'Electronics',
      stock: 10,
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockProduct,
    });

    const { getProduct } = await import('../lib/api/products');
    const result = await getProduct('1');

    expect(result).toEqual(mockProduct);
    expect(fetchApi).toHaveBeenCalledWith('/api/products/1');
  });

  it('should handle API errors gracefully', async () => {
    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('Network error'));

    const { getProducts } = await import('../lib/api/products');

    await expect(getProducts()).rejects.toThrow('Network error');
  });

  it('should return mock data when API fails', async () => {
    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: false,
      data: null,
    });

    const { getProducts } = await import('../lib/api/products');
    const result = await getProducts();

    expect(Array.isArray(result)).toBe(true);
  });
});
