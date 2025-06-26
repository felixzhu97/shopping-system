import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetchApi
vi.mock('../lib/api/config', () => ({
  API_CONFIG: {
    cartUrl: '/api/cart',
  },
  fetchApi: vi.fn(),
}));

describe('Cart API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get cart successfully', async () => {
    const mockCartData = {
      items: [
        {
          productId: 'prod1',
          quantity: 2,
          product: {
            id: 'prod1',
            name: 'Test Product',
            price: 100,
          },
        },
      ],
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockCartData,
    });

    const { getCart } = await import('../lib/api/cart');
    const result = await getCart('user1');

    expect(result).toEqual(mockCartData);
    expect(fetchApi).toHaveBeenCalledWith('/api/cart/user1');
  });

  it('should return empty cart when get cart fails', async () => {
    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: false,
      data: null,
    });

    const { getCart } = await import('../lib/api/cart');
    const result = await getCart('user1');

    expect(result).toEqual({ items: [] });
  });

  it('should add to cart successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [{ productId: 'prod1', quantity: 1 }],
      },
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce(mockResponse);

    const { addToCart } = await import('../lib/api/cart');
    const result = await addToCart('user1', 'prod1', 1);

    expect(result).toEqual(mockResponse);
    expect(fetchApi).toHaveBeenCalledWith('/api/cart/user1', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'prod1',
        quantity: 1,
      }),
    });
  });

  it('should update cart item successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [{ productId: 'prod1', quantity: 3 }],
      },
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce(mockResponse);

    const { updateCartItem } = await import('../lib/api/cart');
    const result = await updateCartItem('user1', 'prod1', 3);

    expect(result).toEqual(mockResponse);
    expect(fetchApi).toHaveBeenCalledWith('/api/cart/user1/item/prod1', {
      method: 'PUT',
      body: JSON.stringify({ quantity: 3 }),
    });
  });

  it('should remove from cart successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        items: [],
      },
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce(mockResponse);

    const { removeFromCart } = await import('../lib/api/cart');
    const result = await removeFromCart('user1', 'prod1');

    expect(result).toEqual(mockResponse);
    expect(fetchApi).toHaveBeenCalledWith('/api/cart/user1/item/prod1', {
      method: 'DELETE',
    });
  });

  it('should clear cart successfully', async () => {
    const mockResponse = {
      success: true,
      data: { items: [] },
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce(mockResponse);

    const { clearCart } = await import('../lib/api/cart');
    const result = await clearCart('user1');

    expect(result).toEqual(mockResponse);
    expect(fetchApi).toHaveBeenCalledWith('/api/cart/user1', {
      method: 'DELETE',
    });
  });
});
