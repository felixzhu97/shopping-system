import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock controllers
vi.mock('../../controllers/productController', () => ({
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

// Mock middleware
vi.mock('../../middleware/adminAuth', () => ({
  adminAuth: vi.fn((req: any, res: any, next: any) => next()),
}));

import * as productController from '../../controllers/productController';
import { adminAuth } from '../../middleware/adminAuth';

// Import routes after mocking
let app: express.Application;

beforeEach(async () => {
  vi.clearAllMocks();

  // Create fresh app instance
  app = express();
  app.use(express.json());

  // Import and use routes
  const { default: productRoutes } = await import('../../routes/products.js');
  app.use('/api/products', productRoutes);
});

describe('Products Routes', () => {
  it('should handle GET /api/products', async () => {
    (productController.getAllProducts as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ products: [] });
    });

    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(productController.getAllProducts).toHaveBeenCalled();
  });

  it('should handle GET /api/products/:id', async () => {
    (productController.getProductById as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ id: req.params.id });
    });

    const response = await request(app).get('/api/products/123');

    expect(response.status).toBe(200);
    expect(productController.getProductById).toHaveBeenCalled();
  });

  it('should handle POST /api/products with admin auth', async () => {
    (productController.createProduct as any).mockImplementation((req: any, res: any) => {
      res.status(201).json({ message: 'Product created' });
    });

    const response = await request(app).post('/api/products').send({ name: 'Test Product' });

    expect(response.status).toBe(201);
    expect(adminAuth).toHaveBeenCalled();
    expect(productController.createProduct).toHaveBeenCalled();
  });

  it('should handle PUT /api/products/:id with admin auth', async () => {
    (productController.updateProduct as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Product updated' });
    });

    const response = await request(app).put('/api/products/123').send({ name: 'Updated Product' });

    expect(response.status).toBe(200);
    expect(adminAuth).toHaveBeenCalled();
    expect(productController.updateProduct).toHaveBeenCalled();
  });

  it('should handle DELETE /api/products/:id with admin auth', async () => {
    (productController.deleteProduct as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Product deleted' });
    });

    const response = await request(app).delete('/api/products/123');

    expect(response.status).toBe(200);
    expect(adminAuth).toHaveBeenCalled();
    expect(productController.deleteProduct).toHaveBeenCalled();
  });
});
