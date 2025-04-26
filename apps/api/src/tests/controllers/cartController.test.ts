import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Cart from '../../models/Cart';
import Product from '../../models/Product';
import * as cartController from '../../controllers/cartController';

// 模拟 Express 的 Request 和 Response 对象
const mockRequest = (body: any = {}, params: any = {}, query: any = {}) =>
  ({
    body,
    params,
    query,
  }) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('购物车控制器', () => {
  let mongoServer: MongoMemoryServer;
  let testProduct: any;
  let testUserId: string;

  // 在每个测试前连接测试数据库
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    await Cart.deleteMany({});
    await Product.deleteMany({});

    // 创建测试用户ID
    testUserId = new mongoose.Types.ObjectId().toString();

    // 创建测试产品
    testProduct = await Product.create({
      name: '测试产品',
      description: '测试描述',
      price: 100,
      image: 'test.jpg',
      category: '测试类别',
      stock: 10,
    });
  });

  // 在每个测试后断开数据库连接
  afterEach(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('getCart', () => {
    it('应该获取空购物车', async () => {
      const req = mockRequest({}, { userId: testUserId });
      const res = mockResponse();

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          items: [],
        })
      );
    });

    it('应该获取已存在的购物车', async () => {
      // 创建购物车
      await Cart.create({
        userId: testUserId,
        items: [
          {
            productId: testProduct._id,
            quantity: 2,
          },
        ],
      });

      const req = mockRequest({}, { userId: testUserId });
      const res = mockResponse();

      await cartController.getCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 2,
              product: expect.objectContaining({
                name: '测试产品',
              }),
            }),
          ]),
        })
      );
    });
  });

  describe('addToCart', () => {
    it('应该添加新商品到购物车', async () => {
      const req = mockRequest(
        {
          productId: testProduct._id.toString(),
          quantity: 1,
        },
        { userId: testUserId }
      );
      const res = mockResponse();

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 1,
              productId: expect.any(Object),
            }),
          ]),
        })
      );
    });

    it('应该增加已存在商品的数量', async () => {
      // 先创建购物车
      await Cart.create({
        userId: testUserId,
        items: [
          {
            productId: testProduct._id,
            quantity: 1,
          },
        ],
      });

      const req = mockRequest(
        {
          productId: testProduct._id.toString(),
          quantity: 2,
        },
        { userId: testUserId }
      );
      const res = mockResponse();

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 3, // 1 + 2
              productId: expect.any(Object),
            }),
          ]),
        })
      );
    });

    it('应该处理库存不足的情况', async () => {
      const req = mockRequest(
        {
          productId: testProduct._id.toString(),
          quantity: 20, // 大于库存量
        },
        { userId: testUserId }
      );
      const res = mockResponse();

      await cartController.addToCart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '库存不足' });
    });
  });

  describe('updateCartItem', () => {
    it('应该更新购物车商品数量', async () => {
      // 先创建购物车
      await Cart.create({
        userId: testUserId,
        items: [
          {
            productId: testProduct._id,
            quantity: 1,
          },
        ],
      });

      const req = mockRequest(
        { quantity: 3 },
        {
          userId: testUserId,
          productId: testProduct._id.toString(),
        }
      );
      const res = mockResponse();

      await cartController.updateCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 3,
              productId: expect.any(Object),
            }),
          ]),
        })
      );
    });

    it('应该在数量为0时移除商品', async () => {
      // 先创建购物车
      await Cart.create({
        userId: testUserId,
        items: [
          {
            productId: testProduct._id,
            quantity: 1,
          },
        ],
      });

      const req = mockRequest(
        { quantity: 0 },
        {
          userId: testUserId,
          productId: testProduct._id.toString(),
        }
      );
      const res = mockResponse();

      await cartController.updateCartItem(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [],
        })
      );
    });
  });

  describe('removeFromCart', () => {
    it('应该从购物车移除商品', async () => {
      // 先创建购物车
      await Cart.create({
        userId: testUserId,
        items: [
          {
            productId: testProduct._id,
            quantity: 1,
          },
        ],
      });

      const req = mockRequest(
        {},
        {
          userId: testUserId,
          productId: testProduct._id.toString(),
        }
      );
      const res = mockResponse();

      await cartController.removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [],
        })
      );
    });

    it('应该处理不存在的商品', async () => {
      // 先创建空购物车
      await Cart.create({
        userId: testUserId,
        items: [],
      });

      const req = mockRequest(
        {},
        {
          userId: testUserId,
          productId: new mongoose.Types.ObjectId().toString(),
        }
      );
      const res = mockResponse();

      await cartController.removeFromCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: '购物车中没有此商品' });
    });
  });

  describe('clearCart', () => {
    it('应该清空购物车', async () => {
      // 先创建购物车
      await Cart.create({
        userId: testUserId,
        items: [
          {
            productId: testProduct._id,
            quantity: 1,
          },
        ],
      });

      const req = mockRequest({}, { userId: testUserId });
      const res = mockResponse();

      await cartController.clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: '购物车已清空' });

      // 验证购物车是否真的被清空
      const cart = await Cart.findOne({ userId: testUserId });
      expect(cart?.items).toHaveLength(0);
    });

    it('应该处理不存在的购物车', async () => {
      const req = mockRequest({}, { userId: new mongoose.Types.ObjectId().toString() });
      const res = mockResponse();

      await cartController.clearCart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: '购物车不存在' });
    });
  });
});
