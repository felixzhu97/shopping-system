import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock crypto utils
vi.mock('../lib/utils/crypto', () => ({
  encryptedStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Cart Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const { result } = renderHook(() => useCartStore());

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should add product to cart', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock: 10,
    };

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('prod1');
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.subtotal).toBe(100);
  });

  it('should update existing item quantity when adding same product', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock: 10,
    };

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addToCart(mockProduct, 1);
      result.current.addToCart(mockProduct, 2);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(4); // 1 + 2 + 1 (initial call) = 4
    expect(result.current.subtotal).toBe(400);
  });

  it('should update cart item quantity', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock: 10,
    };

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addToCart(mockProduct, 1);
      result.current.updateQuantity('prod1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.subtotal).toBe(500);
  });

  it('should remove item from cart', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock: 10,
    };

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addToCart(mockProduct, 1);
      result.current.removeFromCart('prod1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.subtotal).toBe(0);
  });

  it('should clear entire cart', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const mockProduct1 = {
      id: 'prod1',
      name: 'Test Product 1',
      price: 100,
      image: 'test1.jpg',
      description: 'Test description 1',
      category: 'test',
      stock: 10,
    };

    const mockProduct2 = {
      id: 'prod2',
      name: 'Test Product 2',
      price: 200,
      image: 'test2.jpg',
      description: 'Test description 2',
      category: 'test',
      stock: 5,
    };

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addToCart(mockProduct1, 1);
      result.current.addToCart(mockProduct2, 2);
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.subtotal).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('should calculate totals correctly including shipping and tax', async () => {
    const { useCartStore } = await import('../lib/store/cartStore');

    const mockProduct = {
      id: 'prod1',
      name: 'Test Product',
      price: 100,
      image: 'test.jpg',
      description: 'Test description',
      category: 'test',
      stock: 10,
    };

    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addToCart(mockProduct, 1);
    });

    expect(result.current.subtotal).toBe(100);
    expect(result.current.shipping).toBe(10); // Fixed shipping rate
    expect(result.current.tax).toBe(13); // 13% tax rate
    expect(result.current.total).toBe(123); // 100 + 10 + 13
  });
});
