import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../../controllers/cartController';
import Cart from '../../models/Cart';
import Product from '../../models/Product';
import mongoose from 'mongoose';

// Mock dependencies
vi.mock('../../models/Cart');
vi.mock('../../models/Product');
vi.mock('mongoose', async importOriginal => {
  const actual = await importOriginal<typeof import('mongoose')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      isValidObjectId: vi.fn(),
      Types: {
        ...actual.default.Types,
        ObjectId: vi.fn().mockReturnValue('mock-object-id'),
      },
    },
  };
});

const mockCart = Cart as any;
const mockProduct = Product as any;
const mockMongoose = mongoose as any;

describe('Cart Controller', () => {
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

  describe('getCart', () => {
    it('should get cart successfully for valid user', async () => {
      mockReq.params = { userId: 'valid-user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        _id: 'cart-id',
        userId: 'valid-user-id',
        items: [
          {
            productId: {
              _id: 'product-id',
              name: 'Test Product',
              price: 100,
              image: 'test.jpg',
              description: 'Test description',
            },
            quantity: 2,
          },
        ],
      };

      const mockPopulate = vi.fn().mockResolvedValue(mockCartData);
      mockCart.findOne = vi.fn().mockReturnValue({ populate: mockPopulate });

      await getCart(mockReq, mockRes);

      expect(mockCart.findOne).toHaveBeenCalledWith({ userId: 'valid-user-id' });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'cart-id',
        userId: 'valid-user-id',
        items: [
          {
            productId: 'product-id',
            quantity: 2,
            product: {
              id: 'product-id',
              name: 'Test Product',
              price: 100,
              image: 'test.jpg',
              description: 'Test description',
            },
          },
        ],
      });
    });

    it('should create new cart if not exists', async () => {
      mockReq.params = { userId: 'new-user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockPopulate = vi.fn().mockResolvedValue(null);
      mockCart.findOne = vi.fn().mockReturnValue({ populate: mockPopulate });

      const mockNewCart = {
        _id: 'new-cart-id',
        userId: 'new-user-id',
        items: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.mockImplementation(() => mockNewCart);

      await getCart(mockReq, mockRes);

      expect(mockNewCart.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'new-cart-id',
        userId: 'new-user-id',
        items: [],
      });
    });

    it('should handle invalid user id', async () => {
      mockReq.params = { userId: 'invalid-user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(false);

      const mockNewCart = {
        _id: 'new-cart-id',
        userId: 'mock-object-id',
        items: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.mockImplementation(() => mockNewCart);

      await getCart(mockReq, mockRes);

      expect(mockNewCart.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      mockReq.params = { userId: 'user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockPopulate = vi.fn().mockRejectedValue(new Error('Database error'));
      mockCart.findOne = vi.fn().mockReturnValue({ populate: mockPopulate });

      await getCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '获取购物车失败',
      });
    });
  });

  describe('addToCart', () => {
    it('should add product to cart successfully', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = { productId: 'product-id', quantity: 2 };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockProductData = {
        _id: 'product-id',
        name: 'Test Product',
        price: 100,
        stock: 10,
      };

      mockProduct.findById = vi.fn().mockResolvedValue(mockProductData);

      const mockCartData = {
        _id: 'cart-id',
        userId: 'user-id',
        items: [],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      const mockUpdatedCart = {
        _id: 'cart-id',
        items: [{ productId: 'product-id', quantity: 2 }],
      };

      const mockPopulate = vi.fn().mockResolvedValue(mockUpdatedCart);
      mockCart.findById = vi.fn().mockReturnValue({ populate: mockPopulate });

      await addToCart(mockReq, mockRes);

      expect(mockProduct.findById).toHaveBeenCalledWith('product-id');
      expect(mockCartData.items).toEqual([{ productId: 'product-id', quantity: 2 }]);
      expect(mockCartData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedCart);
    });

    it('should return error for non-existent product', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = { productId: 'non-existent', quantity: 1 };

      mockProduct.findById = vi.fn().mockResolvedValue(null);

      await addToCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '产品不存在',
      });
    });

    it('should return error for insufficient stock', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = { productId: 'product-id', quantity: 10 };

      const mockProductData = {
        _id: 'product-id',
        stock: 5,
      };

      mockProduct.findById = vi.fn().mockResolvedValue(mockProductData);

      await addToCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '库存不足',
      });
    });

    it('should update quantity if product already in cart', async () => {
      mockReq.params = { userId: 'user-id' };
      mockReq.body = { productId: 'product-id', quantity: 2 };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockProductData = {
        _id: 'product-id',
        stock: 10,
      };

      mockProduct.findById = vi.fn().mockResolvedValue(mockProductData);

      const mockCartData = {
        _id: 'cart-id',
        items: [{ productId: 'product-id', quantity: 1 }],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      const mockUpdatedCart = { _id: 'cart-id' };
      const mockPopulate = vi.fn().mockResolvedValue(mockUpdatedCart);
      mockCart.findById = vi.fn().mockReturnValue({ populate: mockPopulate });

      await addToCart(mockReq, mockRes);

      expect(mockCartData.items[0].quantity).toBe(3);
      expect(mockCartData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity successfully', async () => {
      mockReq.params = { userId: 'user-id', productId: 'product-id' };
      mockReq.body = { quantity: 3 };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        _id: 'cart-id',
        items: [{ productId: 'product-id', quantity: 2 }],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      const mockUpdatedCart = { _id: 'cart-id' };
      const mockPopulate = vi.fn().mockResolvedValue(mockUpdatedCart);
      mockCart.findById = vi.fn().mockReturnValue({ populate: mockPopulate });

      await updateCartItem(mockReq, mockRes);

      expect(mockCartData.items[0].quantity).toBe(3);
      expect(mockCartData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should remove item if quantity is 0', async () => {
      mockReq.params = { userId: 'user-id', productId: 'product-id' };
      mockReq.body = { quantity: 0 };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        _id: 'cart-id',
        items: [{ productId: 'product-id', quantity: 2 }],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      const mockUpdatedCart = { _id: 'cart-id' };
      const mockPopulate = vi.fn().mockResolvedValue(mockUpdatedCart);
      mockCart.findById = vi.fn().mockReturnValue({ populate: mockPopulate });

      await updateCartItem(mockReq, mockRes);

      expect(mockCartData.items).toHaveLength(0);
      expect(mockCartData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return error for non-existent cart', async () => {
      mockReq.params = { userId: 'user-id', productId: 'product-id' };
      mockReq.body = { quantity: 1 };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      mockCart.findOne = vi.fn().mockResolvedValue(null);

      await updateCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '购物车不存在',
      });
    });

    it('should return error for product not in cart', async () => {
      mockReq.params = { userId: 'user-id', productId: 'different-product' };
      mockReq.body = { quantity: 1 };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        items: [{ productId: 'product-id', quantity: 2 }],
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      await updateCartItem(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '购物车中没有此商品',
      });
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart successfully', async () => {
      mockReq.params = { userId: 'user-id', productId: 'product-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        _id: 'cart-id',
        items: [
          { productId: 'product-id', quantity: 2 },
          { productId: 'other-product', quantity: 1 },
        ],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      const mockUpdatedCart = { _id: 'cart-id' };
      const mockPopulate = vi.fn().mockResolvedValue(mockUpdatedCart);
      mockCart.findById = vi.fn().mockReturnValue({ populate: mockPopulate });

      await removeFromCart(mockReq, mockRes);

      expect(mockCartData.items).toHaveLength(1);
      expect(mockCartData.items[0].productId).toBe('other-product');
      expect(mockCartData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should return error for non-existent cart', async () => {
      mockReq.params = { userId: 'user-id', productId: 'product-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      mockCart.findOne = vi.fn().mockResolvedValue(null);

      await removeFromCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '购物车不存在',
      });
    });

    it('should return error for product not in cart', async () => {
      mockReq.params = { userId: 'user-id', productId: 'non-existent-product' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        items: [{ productId: 'product-id', quantity: 2 }],
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      await removeFromCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '购物车中没有此商品',
      });
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', async () => {
      mockReq.params = { userId: 'user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      const mockCartData = {
        _id: 'cart-id',
        items: [{ productId: 'product-id', quantity: 2 }],
        save: vi.fn().mockResolvedValue(true),
      };

      mockCart.findOne = vi.fn().mockResolvedValue(mockCartData);

      await clearCart(mockReq, mockRes);

      expect(mockCartData.items).toEqual([]);
      expect(mockCartData.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '购物车已清空',
      });
    });

    it('should return error for non-existent cart', async () => {
      mockReq.params = { userId: 'user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      mockCart.findOne = vi.fn().mockResolvedValue(null);

      await clearCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '购物车不存在',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = { userId: 'user-id' };
      mockMongoose.isValidObjectId = vi.fn().mockReturnValue(true);

      mockCart.findOne = vi.fn().mockRejectedValue(new Error('Database error'));

      await clearCart(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '清空购物车失败',
      });
    });
  });
});
