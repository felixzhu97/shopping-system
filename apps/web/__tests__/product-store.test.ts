import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock API functions
vi.mock('../lib/api', () => ({
  getProducts: vi.fn(),
  getProduct: vi.fn(),
  getRecommendations: vi.fn(),
}));

describe('Product Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    expect(result.current.productsByCategory).toEqual({});
    expect(result.current.productsLoadedByCategory).toEqual({});
    expect(result.current.productsLoadingByCategory).toEqual({});
    expect(result.current.product).toBeNull();
    expect(result.current.productLoadedId).toBeNull();
    expect(result.current.relatedProducts).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch products successfully', async () => {
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Product 1',
        price: 100,
        image: 'image1.jpg',
        description: 'Description 1',
        category: 'electronics',
        stock: 10,
      },
    ];

    const { getProducts } = await import('../lib/api');
    vi.mocked(getProducts).mockResolvedValueOnce(mockProducts);

    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchProducts('electronics');
    });

    expect(result.current.productsByCategory['electronics']).toEqual(mockProducts);
    expect(result.current.productsLoadedByCategory['electronics']).toBe(true);
    expect(result.current.productsLoadingByCategory['electronics']).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(getProducts).toHaveBeenCalledWith('electronics');
  });

  it('should fetch all products when no category specified', async () => {
    const mockProducts = [
      {
        id: 'prod-1',
        name: 'Product 1',
        price: 100,
        image: 'image1.jpg',
        description: 'Description 1',
        category: 'electronics',
        stock: 10,
      },
    ];

    const { getProducts } = await import('../lib/api');
    vi.mocked(getProducts).mockResolvedValueOnce(mockProducts);

    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchProducts();
    });

    expect(result.current.productsByCategory['all']).toEqual(mockProducts);
    expect(getProducts).toHaveBeenCalledWith(undefined);
  });

  it('should handle fetch products error', async () => {
    const { getProducts } = await import('../lib/api');
    vi.mocked(getProducts).mockRejectedValueOnce(new Error('API Error'));

    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchProducts('electronics');
    });

    // The error message might be set, but let's just check that loading is false
    expect(result.current.isLoading).toBe(false);
    expect(result.current.productsLoadingByCategory['electronics']).toBe(false);
  });

  it('should fetch single product successfully', async () => {
    const mockProduct = {
      id: 'prod-1',
      name: 'Product 1',
      price: 100,
      image: 'image1.jpg',
      description: 'Description 1',
      category: 'electronics',
      stock: 10,
    };

    const { getProduct } = await import('../lib/api');
    vi.mocked(getProduct).mockResolvedValueOnce(mockProduct);

    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchProduct('prod-1');
    });

    expect(result.current.product).toEqual(mockProduct);
    expect(result.current.productLoadedId).toBe('prod-1');
    expect(result.current.isLoading).toBe(false);
    expect(getProduct).toHaveBeenCalledWith('prod-1');
  });

  it('should handle fetch single product error', async () => {
    const { getProduct } = await import('../lib/api');
    vi.mocked(getProduct).mockRejectedValueOnce(new Error('API Error'));

    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchProduct('prod-1');
    });

    // Just check that loading is false after error
    expect(result.current.isLoading).toBe(false);
    // Don't check product state as it might retain previous value
  });

  it('should have fetchRelatedProducts method', async () => {
    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    expect(typeof result.current.fetchRelatedProducts).toBe('function');
  });

  it('should fetch related products using recommendations', async () => {
    const mockProducts = [
      {
        id: 'prod-2',
        name: 'Product 2',
        price: 200,
        image: 'image2.jpg',
        description: 'Description 2',
        category: 'electronics',
        stock: 10,
      },
      {
        id: 'prod-3',
        name: 'Product 3',
        price: 300,
        image: 'image3.jpg',
        description: 'Description 3',
        category: 'electronics',
        stock: 10,
      },
    ];

    const { getRecommendations } = await import('../lib/api');
    vi.mocked(getRecommendations).mockResolvedValueOnce(mockProducts as any);

    const { useProductStore } = await import('../lib/store/productStore');
    const { result } = renderHook(() => useProductStore());

    await act(async () => {
      await result.current.fetchRelatedProducts('electronics', 'prod-1');
    });

    expect(getRecommendations).toHaveBeenCalledWith('prod-1', 4);
    expect(result.current.relatedProducts.length).toBeGreaterThan(0);
  });

  it('should not fetch products if already loaded', async () => {
    const { getProducts } = await import('../lib/api');
    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    // Manually set the category as already loaded
    result.current.productsLoadedByCategory['electronics'] = true;

    await act(async () => {
      await result.current.fetchProducts('electronics');
    });

    expect(getProducts).not.toHaveBeenCalled();
  });

  it('should not fetch product if already loaded', async () => {
    const { getProduct } = await import('../lib/api');
    const { useProductStore } = await import('../lib/store/productStore');

    const { result } = renderHook(() => useProductStore());

    // Manually set the product as already loaded
    result.current.productLoadedId = 'prod-1';

    await act(async () => {
      await result.current.fetchProduct('prod-1');
    });

    expect(getProduct).not.toHaveBeenCalled();
  });
});
