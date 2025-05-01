import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import Product from '../../models/Product';
import mongoose from 'mongoose';

describe('Product Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/shopping-system-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Product.deleteMany({});
  });

  afterEach(async () => {
    await Product.deleteMany({});
  });

  it('should create a valid product', async () => {
    const productData = {
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Test Category',
      stock: 10,
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    expect(savedProduct).toBeDefined();
    expect(savedProduct.name).toBe('Test Product');
    expect(savedProduct.price).toBe(100);
    expect(savedProduct.description).toBe('Test Description');
    expect(savedProduct.stock).toBe(10);
  });

  it('should validate required fields', async () => {
    const product = new Product({
      name: '',
      price: -1,
      description: '',
      image: '',
      category: '',
      stock: -1,
    });

    try {
      await product.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should update product details', async () => {
    const product = new Product({
      name: 'Test Product',
      price: 100,
      description: 'Test Description',
      image: 'test.jpg',
      category: 'Test Category',
      stock: 10,
    });

    await product.save();

    product.name = 'Updated Product';
    product.price = 200;
    product.description = 'Updated Description';
    product.stock = 20;

    const updatedProduct = await product.save();

    expect(updatedProduct.name).toBe('Updated Product');
    expect(updatedProduct.price).toBe(200);
    expect(updatedProduct.description).toBe('Updated Description');
    expect(updatedProduct.stock).toBe(20);
  });
});
