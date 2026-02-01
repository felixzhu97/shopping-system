import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  cancelOrder,
} from '../../controllers/orderController';
import Order from '../../models/Order';
import Cart from '../../models/Cart';
import Product from '../../models/Product';
import User from '../../models/User';

// Mock dependencies
vi.mock('../../models/Order');
vi.mock('../../models/Cart');
vi.mock('../../models/Product');
vi.mock('../../models/User');

const mockOrder = Order as any;
const mockCart = Cart as any;
const mockProduct = Product as any;
const mockUser = User as any;

describe('Order Controller', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = {
        orderItems: [
          { productId: 'product-id-1', quantity: 2 },
          { productId: 'product-id-2', quantity: 1 },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
        },
        paymentMethod: 'credit_card',
      };

      const mockUserData = {
        _id: 'user-id',
        email: 'test@example.com',
      };

      const mockProducts = [
        {
          _id: 'product-id-1',
          name: 'Product 1',
          price: 100,
          description: 'Description 1',
          image: 'image1.jpg',
        },
        {
          _id: 'product-id-2',
          name: 'Product 2',
          price: 200,
          description: 'Description 2',
          image: 'image2.jpg',
        },
      ];

      const mockSavedOrder = {
        _id: 'order-id',
        userId: 'user-id',
        items: [
          {
            productId: 'product-id-1',
            quantity: 2,
            name: 'Product 1',
            price: 100,
            description: 'Description 1',
            image: 'image1.jpg',
          },
          {
            productId: 'product-id-2',
            quantity: 1,
            name: 'Product 2',
            price: 200,
            description: 'Description 2',
            image: 'image2.jpg',
          },
        ],
        totalAmount: 400,
        status: 'pending',
        shippingAddress: mockReq.body.shippingAddress,
        paymentMethod: 'credit_card',
      };

      mockUser.findById = vi.fn().mockResolvedValue(mockUserData);
      mockProduct.findById = vi
        .fn()
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);

      const mockSave = vi.fn().mockResolvedValue(mockSavedOrder);
      mockOrder.mockImplementation(() => ({
        save: mockSave,
        _id: 'order-id',
        userId: 'user-id',
        items: mockSavedOrder.items,
        totalAmount: mockSavedOrder.totalAmount,
        status: 'pending',
        shippingAddress: mockSavedOrder.shippingAddress,
        paymentMethod: 'credit_card',
      }));

      mockCart.findOneAndUpdate = vi.fn().mockResolvedValue(true);

      await createOrder(mockReq, mockRes);

      expect(mockUser.findById).toHaveBeenCalledWith('user-id');
      expect(mockProduct.findById).toHaveBeenCalledTimes(2);
      expect(mockSave).toHaveBeenCalled();
      expect(mockCart.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-id' },
        { $set: { items: [] } }
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'order-id',
          userId: 'user-id',
          totalAmount: 400,
          status: 'pending',
          paymentMethod: 'credit_card',
        })
      );
    });

    it('should return error for non-existent user', async () => {
      mockReq.params = { userId: 'non-existent-user' };
      mockReq.body = {
        orderItems: [{ productId: 'product-id', quantity: 1 }],
      };

      mockUser.findById = vi.fn().mockResolvedValue(null);

      await createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return error for non-existent product', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = {
        orderItems: [{ productId: 'non-existent-product', quantity: 1 }],
      };

      mockUser.findById = vi.fn().mockResolvedValue({ _id: 'user-id' });
      mockProduct.findById = vi.fn().mockResolvedValue(null);

      await createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to create order',
        error: 'Product not found: non-existent-product',
      });
    });

    it('should handle creation errors', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = {
        orderItems: [{ productId: 'product-id', quantity: 1 }],
      };

      mockUser.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      await createOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to create order',
        error: 'Database error',
      });
    });
  });

  describe('getUserOrders', () => {
    it('should get user orders successfully', async () => {
      mockReq.params = { userId: 'user-id' };

      const mockOrders = [
        {
          _id: 'order-1',
          userId: 'user-id',
          totalAmount: 100,
          status: 'pending',
        },
        {
          _id: 'order-2',
          userId: 'user-id',
          totalAmount: 200,
          status: 'delivered',
        },
      ];

      const mockSort = vi.fn().mockResolvedValue(mockOrders);
      mockOrder.find = vi.fn().mockReturnValue({ sort: mockSort });

      await getUserOrders(mockReq, mockRes);

      expect(mockOrder.find).toHaveBeenCalledWith({ userId: 'user-id' });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      mockReq.params = { userId: 'user-id' };

      const mockSort = vi.fn().mockRejectedValue(new Error('Database error'));
      mockOrder.find = vi.fn().mockReturnValue({ sort: mockSort });

      await getUserOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to fetch user orders',
      });
    });
  });

  describe('getOrderById', () => {
    it('should get order by id successfully', async () => {
      mockReq.params = { id: 'order-id' };

      const mockOrderData = {
        _id: 'order-id',
        userId: 'user-id',
        totalAmount: 100,
        status: 'pending',
      };

      mockOrder.findById = vi.fn().mockResolvedValue(mockOrderData);

      await getOrderById(mockReq, mockRes);

      expect(mockOrder.findById).toHaveBeenCalledWith('order-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockOrderData);
    });

    it('should return error for non-existent order', async () => {
      mockReq.params = { id: 'non-existent-order' };

      mockOrder.findById = vi.fn().mockResolvedValue(null);

      await getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Order not found',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: 'order-id' };

      mockOrder.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      await getOrderById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to fetch order',
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      mockReq.params = { id: 'order-id' };
      mockReq.body = { status: 'shipped' };

      const mockOrderData = {
        _id: 'order-id',
        status: 'pending',
        items: [{ productId: 'product-id', quantity: 2 }],
        save: vi.fn().mockResolvedValue(true),
      };

      mockOrder.findById = vi.fn().mockResolvedValue(mockOrderData);

      await updateOrderStatus(mockReq, mockRes);

      expect(mockOrder.findById).toHaveBeenCalledWith('order-id');
      expect(mockOrderData.status).toBe('shipped');
      expect(mockOrderData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return error for invalid status', async () => {
      mockReq.params = { id: 'order-id' };
      mockReq.body = { status: 'invalid-status' };

      await updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Invalid order status',
      });
    });

    it('should return error for non-existent order', async () => {
      mockReq.params = { id: 'non-existent-order' };
      mockReq.body = { status: 'shipped' };

      mockOrder.findById = vi.fn().mockResolvedValue(null);

      await updateOrderStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Order not found',
      });
    });

    it('should restore stock when order is cancelled', async () => {
      mockReq.params = { id: 'order-id' };
      mockReq.body = { status: 'cancelled' };

      const mockOrderData = {
        _id: 'order-id',
        status: 'pending',
        items: [
          { productId: 'product-id-1', quantity: 2 },
          { productId: 'product-id-2', quantity: 1 },
        ],
        save: vi.fn().mockResolvedValue(true),
      };

      mockOrder.findById = vi.fn().mockResolvedValue(mockOrderData);
      mockProduct.findByIdAndUpdate = vi.fn().mockResolvedValue(true);

      await updateOrderStatus(mockReq, mockRes);

      expect(mockProduct.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(mockProduct.findByIdAndUpdate).toHaveBeenCalledWith('product-id-1', {
        $inc: { stock: 2 },
      });
      expect(mockProduct.findByIdAndUpdate).toHaveBeenCalledWith('product-id-2', {
        $inc: { stock: 1 },
      });
      expect(mockOrderData.status).toBe('cancelled');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllOrders', () => {
    it('should get all orders successfully', async () => {
      mockReq.params = { status: 'all' };

      const mockOrders = [
        { _id: 'order-1', status: 'pending' },
        { _id: 'order-2', status: 'shipped' },
      ];

      const mockPopulate = vi.fn().mockResolvedValue(mockOrders);
      const mockSort = vi.fn().mockReturnValue({ populate: mockPopulate });
      mockOrder.find = vi.fn().mockReturnValue({ sort: mockSort });

      await getAllOrders(mockReq, mockRes);

      expect(mockOrder.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockPopulate).toHaveBeenCalledWith('userId', 'username email');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should filter orders by status', async () => {
      mockReq.params = { status: 'pending' };

      const mockOrders = [{ _id: 'order-1', status: 'pending' }];

      const mockPopulate = vi.fn().mockResolvedValue(mockOrders);
      const mockSort = vi.fn().mockReturnValue({ populate: mockPopulate });
      mockOrder.find = vi.fn().mockReturnValue({ sort: mockSort });

      await getAllOrders(mockReq, mockRes);

      expect(mockOrder.find).toHaveBeenCalledWith({ status: 'pending' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockOrders);
    });

    it('should handle errors', async () => {
      mockReq.params = { status: 'all' };

      const mockPopulate = vi.fn().mockRejectedValue(new Error('Database error'));
      const mockSort = vi.fn().mockReturnValue({ populate: mockPopulate });
      mockOrder.find = vi.fn().mockReturnValue({ sort: mockSort });

      await getAllOrders(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Failed to fetch orders',
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      mockReq.params = { id: 'order-id' };

      const mockOrderData = {
        _id: 'order-id',
        status: 'pending',
        items: [
          { productId: 'product-id-1', quantity: 2 },
          { productId: 'product-id-2', quantity: 1 },
        ],
        save: vi.fn().mockResolvedValue({
          _id: 'order-id',
          status: 'cancelled',
        }),
      };

      const mockProducts = [
        { _id: 'product-id-1', stock: 10, save: vi.fn() },
        { _id: 'product-id-2', stock: 5, save: vi.fn() },
      ];

      mockOrder.findById = vi.fn().mockResolvedValue(mockOrderData);
      mockProduct.findById = vi
        .fn()
        .mockResolvedValueOnce(mockProducts[0])
        .mockResolvedValueOnce(mockProducts[1]);

      await cancelOrder(mockReq, mockRes);

      expect(mockOrder.findById).toHaveBeenCalledWith('order-id');
      expect(mockOrderData.status).toBe('cancelled');
      expect(mockOrderData.save).toHaveBeenCalled();
      expect(mockProducts[0].stock).toBe(12);
      expect(mockProducts[1].stock).toBe(6);
      expect(mockProducts[0].save).toHaveBeenCalled();
      expect(mockProducts[1].save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { _id: 'order-id', status: 'cancelled' },
      });
    });

    it('should return error for non-existent order', async () => {
      mockReq.params = { id: 'non-existent-order' };

      mockOrder.findById = vi.fn().mockResolvedValue(null);

      await cancelOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Order not found',
      });
    });

    it('should return error for non-pending order', async () => {
      mockReq.params = { id: 'order-id' };

      const mockOrderData = {
        _id: 'order-id',
        status: 'shipped',
      };

      mockOrder.findById = vi.fn().mockResolvedValue(mockOrderData);

      await cancelOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only pending orders can be cancelled',
      });
    });

    it('should handle save errors', async () => {
      mockReq.params = { id: 'order-id' };

      const mockOrderData = {
        _id: 'order-id',
        status: 'pending',
        items: [{ productId: 'product-id', quantity: 1 }],
        save: vi.fn().mockRejectedValue(new Error('Save error')),
      };

      mockOrder.findById = vi.fn().mockResolvedValue(mockOrderData);

      await cancelOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to cancel order',
        error: 'Error saving order status',
      });
    });

    it('should handle general errors', async () => {
      mockReq.params = { id: 'order-id' };

      mockOrder.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      await cancelOrder(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to cancel order',
        error: 'Database error',
      });
    });
  });
});
