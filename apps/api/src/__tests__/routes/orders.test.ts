import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock controllers
vi.mock('../../controllers/orderController', () => ({
  createOrder: vi.fn(),
  getUserOrders: vi.fn(),
  getOrderById: vi.fn(),
  getAllOrders: vi.fn(),
  cancelOrder: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

// Mock middleware
vi.mock('../../middleware/adminAuth', () => ({
  adminAuth: vi.fn((req: any, res: any, next: any) => next()),
}));

import * as orderController from '../../controllers/orderController';
import { adminAuth } from '../../middleware/adminAuth';

let app: express.Application;

beforeEach(async () => {
  vi.clearAllMocks();

  app = express();
  app.use(express.json());

  const { default: orderRoutes } = await import('../../routes/orders.js');
  app.use('/api/orders', orderRoutes);
});

describe('Orders Routes', () => {
  it('should handle POST /api/orders/:userId', async () => {
    (orderController.createOrder as any).mockImplementation((req: any, res: any) => {
      res.status(201).json({ message: 'Order created' });
    });

    const response = await request(app).post('/api/orders/user123').send({ items: [] });

    expect(response.status).toBe(201);
    expect(orderController.createOrder).toHaveBeenCalled();
  });

  it('should handle GET /api/orders/user/:userId', async () => {
    (orderController.getUserOrders as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ orders: [] });
    });

    const response = await request(app).get('/api/orders/user/user123');

    expect(response.status).toBe(200);
    expect(orderController.getUserOrders).toHaveBeenCalled();
  });

  it('should handle GET /api/orders/:id', async () => {
    (orderController.getOrderById as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ id: req.params.id });
    });

    const response = await request(app).get('/api/orders/order123');

    expect(response.status).toBe(200);
    expect(orderController.getOrderById).toHaveBeenCalled();
  });

  it('should handle GET /api/orders with admin auth', async () => {
    (orderController.getAllOrders as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ orders: [] });
    });

    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(200);
    expect(adminAuth).toHaveBeenCalled();
    expect(orderController.getAllOrders).toHaveBeenCalled();
  });

  it('should handle POST /api/orders/:id/cancel', async () => {
    (orderController.cancelOrder as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Order cancelled' });
    });

    const response = await request(app).post('/api/orders/order123/cancel');

    expect(response.status).toBe(200);
    expect(orderController.cancelOrder).toHaveBeenCalled();
  });
});
