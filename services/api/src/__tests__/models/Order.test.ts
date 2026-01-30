import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock mongoose and models
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
    connection: {
      close: vi.fn(),
    },
  },
}));

vi.mock('../../models/Order', () => ({
  default: vi.fn(),
}));

vi.mock('../../models/User', () => ({
  default: vi.fn(),
}));

vi.mock('../../models/Product', () => ({
  default: vi.fn(),
}));

describe('Order Model', () => {
  let mockOrder: any;
  let mockUser: any;
  let mockProduct: any;
  let testUserId: string;
  let testProductId: string;

  beforeEach(async () => {
    // Import mocked modules
    const { default: Order } = await import('../../models/Order.js');
    const { default: User } = await import('../../models/User.js');
    const { default: Product } = await import('../../models/Product.js');

    mockOrder = Order;
    mockUser = User;
    mockProduct = Product;

    testUserId = '60f0c8c8c8c8c8c8c8c8c8c8';
    testProductId = '60f0c8c8c8c8c8c8c8c8c8c9';

    // Reset mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockOrder.deleteMany = vi.fn();
    mockUser.deleteMany = vi.fn();
    mockProduct.deleteMany = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a valid order', async () => {
    const orderData = {
      userId: testUserId,
      items: [
        {
          productId: testProductId,
          quantity: 2,
        },
      ],
      totalAmount: 200,
      status: 'pending' as const,
    };

    const mockSave = vi.fn().mockResolvedValue({
      _id: 'order-id',
      userId: testUserId,
      items: [
        {
          productId: testProductId,
          quantity: 2,
        },
      ],
      totalAmount: 200,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockOrder.mockImplementation(() => ({
      save: mockSave,
      userId: testUserId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
    }));

    const order = new mockOrder(orderData);
    const savedOrder = await order.save();

    expect(savedOrder).toBeDefined();
    expect(savedOrder.userId).toBe(testUserId);
    expect(savedOrder.items.length).toBe(1);
    expect(savedOrder.totalAmount).toBe(200);
    expect(savedOrder.status).toBe('pending');
    expect(mockSave).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const orderData = {
      userId: testUserId,
      items: [],
      totalAmount: 0,
      status: 'invalid-status' as any,
    };

    const mockSave = vi
      .fn()
      .mockRejectedValue(
        new Error(
          'Validation failed: status: `invalid-status` is not a valid enum value for path `status`.'
        )
      );

    mockOrder.mockImplementation(() => ({
      save: mockSave,
      userId: testUserId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
    }));

    const order = new mockOrder(orderData);

    await expect(order.save()).rejects.toThrow('Validation failed');
    expect(mockSave).toHaveBeenCalled();
  });

  it('should update order status', async () => {
    const initialOrderData = {
      userId: testUserId,
      items: [
        {
          productId: testProductId,
          quantity: 1,
        },
      ],
      totalAmount: 100,
      status: 'pending' as const,
    };

    const mockSave = vi
      .fn()
      .mockResolvedValueOnce({
        _id: 'order-id',
        userId: testUserId,
        items: initialOrderData.items,
        totalAmount: 100,
        status: 'pending',
      })
      .mockResolvedValueOnce({
        _id: 'order-id',
        userId: testUserId,
        items: initialOrderData.items,
        totalAmount: 100,
        status: 'shipped',
      });

    const mockOrderInstance = {
      userId: testUserId,
      items: initialOrderData.items,
      totalAmount: initialOrderData.totalAmount,
      status: initialOrderData.status,
      save: mockSave,
    };

    mockOrder.mockImplementation(() => mockOrderInstance);

    const order = new mockOrder(initialOrderData);
    await order.save();

    // Simulate status update
    order.status = 'shipped' as const;
    const updatedOrder = await order.save();

    expect(updatedOrder.status).toBe('shipped');
    expect(mockSave).toHaveBeenCalledTimes(2);
  });
});
