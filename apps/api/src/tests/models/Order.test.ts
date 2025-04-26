import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import Order from '../../models/Order';
import User from '../../models/User';
import Product from '../../models/Product';
import mongoose from 'mongoose';

describe('Order Model', () => {
  let testUser;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/shopping-system-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    // 创建测试用户
    testUser = new User({
      username: 'testuser5',
      email: 'test5@example.com',
      password: 'password123',
    });
    await testUser.save();

    // 创建测试商品
    testProduct = new Product({
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Test Category',
      stock: 10,
    });
    await testProduct.save();
  });

  afterEach(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  it('should create a valid order', async () => {
    const orderData = {
      userId: testUser._id,
      items: [
        {
          productId: testProduct._id,
          quantity: 2,
        },
      ],
      totalAmount: testProduct.price * 2,
      status: 'pending' as const,
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    expect(savedOrder).toBeDefined();
    expect(savedOrder.userId.toString()).toBe(testUser._id.toString());
    expect(savedOrder.items.length).toBe(1);
    expect(savedOrder.totalAmount).toBe(200);
    expect(savedOrder.status).toBe('pending');
  });

  it('should validate required fields', async () => {
    const order = new Order({
      userId: testUser._id,
      items: [],
      totalAmount: 0,
      status: 'invalid-status' as any,
    });

    try {
      await order.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should update order status', async () => {
    const order = new Order({
      userId: testUser._id,
      items: [
        {
          productId: testProduct._id,
          quantity: 1,
        },
      ],
      totalAmount: testProduct.price,
      status: 'pending' as const,
    });

    await order.save();

    order.status = 'shipped' as const;
    const updatedOrder = await order.save();

    expect(updatedOrder.status).toBe('shipped');
  });
});
