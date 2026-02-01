import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  importProductsFromCsv,
  importProductsFromJson,
} from '../../controllers/productController';
import Product from '../../models/Product';

// Mock dependencies
vi.mock('../../models/Product');

const mockProduct = Product as any;

describe('Product Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
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

  describe('getAllProducts', () => {
    it('should get all products successfully', async () => {
      const mockProducts = [
        {
          _id: 'product1',
          name: 'Product 1',
          price: 100,
          category: 'Electronics',
        },
        {
          _id: 'product2',
          name: 'Product 2',
          price: 200,
          category: 'Clothing',
        },
      ];

      mockProduct.find = vi.fn().mockResolvedValue(mockProducts);

      await getAllProducts(mockReq as Request, mockRes as Response);

      expect(mockProduct.find).toHaveBeenCalledWith({});
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should filter products by category', async () => {
      mockReq.query = { category: 'Electronics' };

      const mockProducts = [
        {
          _id: 'product1',
          name: 'Product 1',
          price: 100,
          category: 'Electronics',
        },
      ];

      mockProduct.find = vi.fn().mockResolvedValue(mockProducts);

      await getAllProducts(mockReq as Request, mockRes as Response);

      expect(mockProduct.find).toHaveBeenCalledWith({
        category: new RegExp('Electronics', 'i'),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle home-kitchen category specially', async () => {
      mockReq.query = { category: 'home-kitchen' };

      const mockProducts = [
        {
          _id: 'product1',
          name: 'Kitchen Product',
          price: 50,
          category: 'Home & Kitchen',
        },
      ];

      mockProduct.find = vi.fn().mockResolvedValue(mockProducts);

      await getAllProducts(mockReq as Request, mockRes as Response);

      expect(mockProduct.find).toHaveBeenCalledWith({
        $or: [
          { category: 'Home & Kitchen' },
          { category: 'Home-Kitchen' },
          { category: 'home-kitchen' },
        ],
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
    });

    it('should handle errors', async () => {
      mockProduct.find = vi.fn().mockRejectedValue(new Error('Database error'));

      await getAllProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '获取产品列表失败',
      });
    });
  });

  describe('getProductById', () => {
    it('should get product by id successfully', async () => {
      mockReq.params = { id: 'product-id' };

      const mockProductData = {
        _id: 'product-id',
        name: 'Test Product',
        price: 100,
        category: 'Electronics',
      };

      mockProduct.findById = vi.fn().mockResolvedValue(mockProductData);

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockProduct.findById).toHaveBeenCalledWith('product-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProductData);
    });

    it('should return error for non-existent product', async () => {
      mockReq.params = { id: 'non-existent-id' };

      mockProduct.findById = vi.fn().mockResolvedValue(null);

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '产品不存在',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: 'product-id' };

      mockProduct.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '获取产品详情失败',
      });
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const productData = {
        name: 'New Product',
        price: 150,
        category: 'Electronics',
        description: 'A new product',
      };

      mockReq.body = productData;

      const savedProduct = {
        _id: 'new-product-id',
        ...productData,
      };

      const mockSave = vi.fn().mockResolvedValue(savedProduct);
      mockProduct.mockImplementation(() => ({
        save: mockSave,
      }));

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockProduct).toHaveBeenCalledWith(productData);
      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(savedProduct);
    });

    it('should handle creation errors', async () => {
      mockReq.body = {
        name: 'New Product',
        price: 150,
      };

      const mockSave = vi.fn().mockRejectedValue(new Error('Validation error'));
      mockProduct.mockImplementation(() => ({
        save: mockSave,
      }));

      await createProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '创建产品失败',
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      mockReq.params = { id: 'product-id' };
      mockReq.body = {
        name: 'Updated Product',
        price: 200,
      };

      const existingProduct = {
        _id: 'product-id',
        name: 'Old Product',
        price: 100,
      };

      const updatedProduct = {
        _id: 'product-id',
        name: 'Updated Product',
        price: 200,
      };

      mockProduct.findById = vi.fn().mockResolvedValue(existingProduct);
      mockProduct.findByIdAndUpdate = vi.fn().mockResolvedValue(updatedProduct);

      await updateProduct(mockReq as Request, mockRes as Response);

      expect(mockProduct.findById).toHaveBeenCalledWith('product-id');
      expect(mockProduct.findByIdAndUpdate).toHaveBeenCalledWith(
        'product-id',
        { name: 'Updated Product', price: 200 },
        { new: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedProduct);
    });

    it('should return error for non-existent product', async () => {
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { name: 'Updated Product' };

      mockProduct.findById = vi.fn().mockResolvedValue(null);

      await updateProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '产品不存在',
      });
    });

    it('should handle update errors', async () => {
      mockReq.params = { id: 'product-id' };
      mockReq.body = { name: 'Updated Product' };

      mockProduct.findById = vi.fn().mockResolvedValue({ _id: 'product-id' });
      mockProduct.findByIdAndUpdate = vi.fn().mockRejectedValue(new Error('Update error'));

      await updateProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '更新产品失败',
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockReq.params = { id: 'product-id' };

      const existingProduct = {
        _id: 'product-id',
        name: 'Product to Delete',
      };

      mockProduct.findById = vi.fn().mockResolvedValue(existingProduct);
      mockProduct.findByIdAndDelete = vi.fn().mockResolvedValue(existingProduct);

      await deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockProduct.findById).toHaveBeenCalledWith('product-id');
      expect(mockProduct.findByIdAndDelete).toHaveBeenCalledWith('product-id');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '产品已删除',
      });
    });

    it('should return error for non-existent product', async () => {
      mockReq.params = { id: 'non-existent-id' };

      mockProduct.findById = vi.fn().mockResolvedValue(null);

      await deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '产品不存在',
      });
    });

    it('should handle delete errors', async () => {
      mockReq.params = { id: 'product-id' };

      mockProduct.findById = vi.fn().mockResolvedValue({ _id: 'product-id' });
      mockProduct.findByIdAndDelete = vi.fn().mockRejectedValue(new Error('Delete error'));

      await deleteProduct(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '删除产品失败',
      });
    });
  });

  describe('importProductsFromCsv', () => {
    it('should import products from CSV successfully', async () => {
      const csv = [
        'name,description,price,image,category,stock,modelKey,originalPrice,inStock,rating,reviewCount',
        'Product A,Desc A,10.5,https://example.com/a.png,Electronics,3,mk1,12.0,true,4.2,10',
        'Product B,Desc B,20,https://example.com/b.png,Clothing,0,, ,false,0,0',
      ].join('\n');

      mockReq.body = csv;
      mockProduct.insertMany = vi.fn().mockResolvedValue([
        { id: 'p1' },
        { id: 'p2' },
      ]);

      await importProductsFromCsv(mockReq as Request, mockRes as Response);

      expect(mockProduct.insertMany).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        createdCount: 2,
        createdIds: ['p1', 'p2'],
        errors: [],
      });
    });

    it('should return row-level errors when required fields missing', async () => {
      const csv = [
        'name,description,price,image,category,stock',
        'Valid,Desc,9.99,https://example.com/a.png,Electronics,1',
        ',Missing name,10,https://example.com/b.png,Electronics,1',
      ].join('\n');

      mockReq.body = csv;
      mockProduct.insertMany = vi.fn().mockResolvedValue([{ id: 'p1' }]);

      await importProductsFromCsv(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      const payload = (mockRes.json as any).mock.calls[0][0];
      expect(payload.createdCount).toBe(1);
      expect(payload.errors.length).toBe(1);
      expect(payload.errors[0].rowNumber).toBe(3);
    });

    it('should reject empty CSV', async () => {
      mockReq.body = '';

      await importProductsFromCsv(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'CSV内容为空' });
    });
  });

  describe('importProductsFromJson', () => {
    it('should import products from JSON successfully', async () => {
      mockReq.body = [
        {
          name: 'Product A',
          description: 'Desc A',
          price: 10.5,
          image: 'https://example.com/a.png',
          category: 'Electronics',
          stock: 3,
        },
        {
          name: 'Product B',
          description: 'Desc B',
          price: 20,
          image: 'https://example.com/b.png',
          category: 'Clothing',
          stock: 0,
          inStock: false,
        },
      ];

      mockProduct.insertMany = vi.fn().mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

      await importProductsFromJson(mockReq as Request, mockRes as Response);

      expect(mockProduct.insertMany).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        createdCount: 2,
        createdIds: ['p1', 'p2'],
        errors: [],
      });
    });

    it('should reject invalid payload shape', async () => {
      mockReq.body = { foo: 'bar' };

      await importProductsFromJson(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid JSON payload' });
    });

    it('should return errors when items invalid and still create valid ones', async () => {
      mockReq.body = [
        'not-an-object',
        {
          name: '',
          description: 'Desc',
          price: 10,
          image: 'https://example.com/a.png',
          category: 'Electronics',
          stock: 1,
        },
        {
          name: 'Valid',
          description: 'Desc',
          price: 10,
          image: 'https://example.com/a.png',
          category: 'Electronics',
          stock: 1,
        },
      ];

      mockProduct.insertMany = vi.fn().mockResolvedValue([{ id: 'p1' }]);

      await importProductsFromJson(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      const payload = (mockRes.json as any).mock.calls[0][0];
      expect(payload.createdCount).toBe(1);
      expect(payload.createdIds).toEqual(['p1']);
      expect(payload.errors.length).toBe(2);
      expect(payload.errors[0].index).toBe(0);
      expect(payload.errors[1].index).toBe(1);
    });
  });
});
