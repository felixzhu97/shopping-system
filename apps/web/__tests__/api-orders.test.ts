import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetchApi
vi.mock('../lib/api/config', () => ({
  API_CONFIG: {
    orderUrl: '/api/orders',
  },
  fetchApi: vi.fn(),
}));

describe('Orders API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get all orders successfully', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        userId: 'user-1',
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            price: 100,
          },
        ],
        total: 200,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockOrders,
    });

    const { getOrders } = await import('../lib/api/orders');
    const result = await getOrders();

    expect(result).toEqual(mockOrders);
    expect(fetchApi).toHaveBeenCalledWith('/api/orders');
  });

  it('should get order by ID successfully', async () => {
    const mockOrder = {
      id: 'order-1',
      userId: 'user-1',
      items: [
        {
          productId: 'prod-1',
          quantity: 2,
          price: 100,
        },
      ],
      total: 200,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00Z',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockOrder,
    });

    const { getOrderById } = await import('../lib/api/orders');
    const result = await getOrderById('order-1');

    expect(result).toEqual(mockOrder);
    expect(fetchApi).toHaveBeenCalledWith('/api/orders/order-1');
  });

  it('should create order successfully', async () => {
    const orderData = {
      orderItems: [
        {
          productId: 'prod-1',
          quantity: 2,
        },
      ],
      shippingAddress: {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
      },
      paymentMethod: 'credit_card',
    };

    const mockCreatedOrder = {
      id: 'order-1',
      userId: 'user-1',
      items: orderData.orderItems,
      total: 200,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00Z',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockCreatedOrder,
    });

    const { createOrder } = await import('../lib/api/orders');
    const result = await createOrder('user-1', orderData);

    expect(result).toEqual(mockCreatedOrder);
    expect(fetchApi).toHaveBeenCalledWith('/api/orders/user-1', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  });

  it('should get user orders successfully', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        userId: 'user-1',
        items: [],
        total: 200,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockOrders,
    });

    const { getUserOrders } = await import('../lib/api/orders');
    const result = await getUserOrders('user-1');

    expect(result).toEqual(mockOrders);
    expect(fetchApi).toHaveBeenCalledWith('/api/orders/user/user-1');
  });

  it('should cancel order successfully', async () => {
    const mockCancelledOrder = {
      id: 'order-1',
      userId: 'user-1',
      items: [],
      total: 200,
      status: 'cancelled',
      createdAt: '2024-01-01T00:00:00Z',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockCancelledOrder,
    });

    const { cancelOrder } = await import('../lib/api/orders');
    const result = await cancelOrder('order-1');

    expect(result).toEqual(mockCancelledOrder);
    expect(fetchApi).toHaveBeenCalledWith('/api/orders/order-1/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
  });

  it('should handle API errors gracefully', async () => {
    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('Network error'));

    const { getOrders } = await import('../lib/api/orders');

    await expect(getOrders()).rejects.toThrow('Network error');
  });
});
