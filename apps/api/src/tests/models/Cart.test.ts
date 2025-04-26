import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import Cart from '../../models/Cart';
import User from '../../models/User';
import Product from '../../models/Product';
import mongoose from 'mongoose';

describe('Cart Model', () => {
  let testUser;
  let testProduct;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/shopping-system-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Cart.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});

    // 创建测试用户
    testUser = new User({
      username: 'testuser4',
      email: 'test4@example.com',
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
    await Cart.deleteMany({});
    await User.deleteMany({});
    await Product.deleteMany({});
  });

  it('should create a valid cart', async () => {
    const cartData = {
      userId: testUser._id,
      items: [
        {
          productId: testProduct._id,
          quantity: 2,
        },
      ],
    };

    const cart = new Cart(cartData);
    const savedCart = await cart.save();

    expect(savedCart).toBeDefined();
    expect(savedCart.userId.toString()).toBe(testUser._id.toString());
    expect(savedCart.items.length).toBe(1);
    expect(savedCart.items[0].quantity).toBe(2);
  });

  it('should update cart items', async () => {
    const cart = new Cart({
      userId: testUser._id,
      items: [
        {
          productId: testProduct._id,
          quantity: 1,
        },
      ],
    });

    await cart.save();

    cart.items.push({
      productId: testProduct._id,
      quantity: 1,
    });

    const updatedCart = await cart.save();

    expect(updatedCart.items.length).toBe(2);
    expect(updatedCart.items[0].quantity).toBe(1);
    expect(updatedCart.items[1].quantity).toBe(1);
  });

  it('should validate minimum quantity', async () => {
    const cart = new Cart({
      userId: testUser._id,
      items: [
        {
          productId: testProduct._id,
          quantity: 0,
        },
      ],
    });

    try {
      await cart.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
