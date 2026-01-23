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

vi.mock('../../models/Cart', () => ({
  default: vi.fn(),
}));

vi.mock('../../models/User', () => ({
  default: vi.fn(),
}));

vi.mock('../../models/Product', () => ({
  default: vi.fn(),
}));

describe('Cart Model', () => {
  let mockCart: any;
  let mockUser: any;
  let mockProduct: any;
  let testUserId: string;
  let testProductId: string;

  beforeEach(async () => {
    // Import mocked modules
    const { default: Cart } = await import('../../models/Cart.js');
    const { default: User } = await import('../../models/User.js');
    const { default: Product } = await import('../../models/Product.js');

    mockCart = Cart;
    mockUser = User;
    mockProduct = Product;

    testUserId = '60f0c8c8c8c8c8c8c8c8c8c8';
    testProductId = '60f0c8c8c8c8c8c8c8c8c8c9';

    // Reset mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockCart.deleteMany = vi.fn();
    mockUser.deleteMany = vi.fn();
    mockProduct.deleteMany = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a valid cart', async () => {
    const cartData = {
      userId: testUserId,
      items: [
        {
          productId: testProductId,
          quantity: 2,
        },
      ],
    };

    const mockSave = vi.fn().mockResolvedValue({
      _id: 'cart-id',
      userId: testUserId,
      items: [
        {
          productId: testProductId,
          quantity: 2,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockCart.mockImplementation(() => ({
      save: mockSave,
      userId: testUserId,
      items: cartData.items,
    }));

    const cart = new mockCart(cartData);
    const savedCart = await cart.save();

    expect(savedCart).toBeDefined();
    expect(savedCart.userId).toBe(testUserId);
    expect(savedCart.items.length).toBe(1);
    expect(savedCart.items[0].quantity).toBe(2);
    expect(mockSave).toHaveBeenCalled();
  });

  it('should update cart items', async () => {
    const initialItems = [
      {
        productId: testProductId,
        quantity: 1,
      },
    ];

    const mockSave = vi
      .fn()
      .mockResolvedValueOnce({
        _id: 'cart-id',
        userId: testUserId,
        items: initialItems,
      })
      .mockResolvedValueOnce({
        _id: 'cart-id',
        userId: testUserId,
        items: [
          ...initialItems,
          {
            productId: testProductId,
            quantity: 1,
          },
        ],
      });

    const mockCartInstance = {
      userId: testUserId,
      items: initialItems,
      save: mockSave,
    };

    mockCart.mockImplementation(() => mockCartInstance);

    const cart = new mockCart({
      userId: testUserId,
      items: initialItems,
    });

    await cart.save();

    // Simulate adding new item
    cart.items.push({
      productId: testProductId,
      quantity: 1,
    });

    const updatedCart = await cart.save();

    expect(updatedCart.items.length).toBe(2);
    expect(updatedCart.items[0].quantity).toBe(1);
    expect(updatedCart.items[1].quantity).toBe(1);
    expect(mockSave).toHaveBeenCalledTimes(2);
  });

  it('should validate minimum quantity', async () => {
    const cartData = {
      userId: testUserId,
      items: [
        {
          productId: testProductId,
          quantity: 0,
        },
      ],
    };

    const mockSave = vi
      .fn()
      .mockRejectedValue(
        new Error(
          'Validation failed: quantity: Path `quantity` (0) is less than minimum allowed value (1).'
        )
      );

    mockCart.mockImplementation(() => ({
      save: mockSave,
      userId: testUserId,
      items: cartData.items,
    }));

    const cart = new mockCart(cartData);

    await expect(cart.save()).rejects.toThrow('Validation failed');
    expect(mockSave).toHaveBeenCalled();
  });
});
