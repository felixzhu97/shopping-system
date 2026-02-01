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
  importProductsFromCsv: vi.fn(),
  importProductsFromJson: vi.fn(),
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

  it('should handle POST /api/products/import/csv with admin auth', async () => {
    (productController.importProductsFromCsv as any).mockImplementation((req: any, res: any) => {
      res.status(201).json({ createdCount: 1 });
    });

    const csv = 'name,description,price,image,category,stock\nTest,Desc,9.99,https://example.com/a.png,Electronics,10\n';
    const response = await request(app)
      .post('/api/products/import/csv')
      .set('Content-Type', 'text/csv')
      .send(csv);

    expect(response.status).toBe(201);
    expect(adminAuth).toHaveBeenCalled();
    expect(productController.importProductsFromCsv).toHaveBeenCalled();
  });

  it('should handle POST /api/products/import/json with admin auth', async () => {
    (productController.importProductsFromJson as any).mockImplementation((req: any, res: any) => {
      res.status(201).json({ createdCount: 1 });
    });

    const response = await request(app)
      .post('/api/products/import/json')
      .send([{ name: 'Test', description: 'Desc', price: 9.99, image: 'https://example.com/a.png', category: 'Electronics', stock: 1 }]);

    expect(response.status).toBe(201);
    expect(adminAuth).toHaveBeenCalled();
    expect(productController.importProductsFromJson).toHaveBeenCalled();
  });
});
