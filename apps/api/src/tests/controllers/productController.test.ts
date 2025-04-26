import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { describe, it, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import * as productController from '../controllers/productController';
import Product from '../models/Product';

describe('ProductController', () => {
  let mongoServer: MongoMemoryServer;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  beforeEach(() => {
    mockReq = {
      query: {},
    };
    mockRes = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const testProduct = new Product({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'Test Category',
        image: 'test-image.jpg',
        stock: 10,
      });
      await testProduct.save();

      await productController.getAllProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Product',
            price: 100,
          }),
        ])
      );
    });

    it('should filter products by category', async () => {
      const testProduct1 = new Product({
        name: 'Test Product 1',
        price: 100,
        description: 'Test Description 1',
        category: 'Category A',
        image: 'test-image-1.jpg',
        stock: 10,
      });
      const testProduct2 = new Product({
        name: 'Test Product 2',
        price: 200,
        description: 'Test Description 2',
        category: 'Category B',
        image: 'test-image-2.jpg',
        stock: 20,
      });
      await Promise.all([testProduct1.save(), testProduct2.save()]);

      mockReq.query = { category: 'Category A' };

      await productController.getAllProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Product 1',
            category: 'Category A',
          }),
        ])
      );
      expect(mockRes.json).not.toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Test Product 2',
            category: 'Category B',
          }),
        ])
      );
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const testProduct = new Product({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'Test Category',
        image: 'test-image.jpg',
        stock: 10,
      });
      const savedProduct = await testProduct.save();

      mockReq.params = { id: savedProduct._id.toString() };

      await productController.getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Product',
          price: 100,
        })
      );
    });

    it('should return 404 if product not found', async () => {
      mockReq.params = { id: new mongoose.Types.ObjectId().toString() };

      await productController.getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: '产品不存在' });
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      mockReq.body = {
        name: 'New Product',
        price: 200,
        description: 'New Description',
        category: 'New Category',
        image: 'new-image.jpg',
        stock: 15,
      };

      await productController.createProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product',
          price: 200,
        })
      );
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const testProduct = new Product({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'Test Category',
        image: 'test-image.jpg',
        stock: 10,
      });
      const savedProduct = await testProduct.save();

      mockReq.params = { id: savedProduct._id.toString() };
      mockReq.body = {
        name: 'Updated Product',
        price: 150,
      };

      await productController.updateProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Product',
          price: 150,
        })
      );
    });

    it('should return 404 if product not found', async () => {
      mockReq.params = { id: new mongoose.Types.ObjectId().toString() };
      mockReq.body = {
        name: 'Updated Product',
        price: 150,
      };

      await productController.updateProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: '产品不存在' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product', async () => {
      const testProduct = new Product({
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'Test Category',
        image: 'test-image.jpg',
        stock: 10,
      });
      const savedProduct = await testProduct.save();

      mockReq.params = { id: savedProduct._id.toString() };

      await productController.deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ message: '产品已删除' });

      const deletedProduct = await Product.findById(savedProduct._id);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 if product not found', async () => {
      mockReq.params = { id: new mongoose.Types.ObjectId().toString() };

      await productController.deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: '产品不存在' });
    });
  });
});
