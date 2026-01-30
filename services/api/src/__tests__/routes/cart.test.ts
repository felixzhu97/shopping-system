import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock controllers
vi.mock('../../controllers/cartController', () => ({
  getCart: vi.fn(),
  addToCart: vi.fn(),
  updateCartItem: vi.fn(),
  removeFromCart: vi.fn(),
  clearCart: vi.fn(),
}));

import * as cartController from '../../controllers/cartController';

let app: express.Application;

beforeEach(async () => {
  vi.clearAllMocks();

  app = express();
  app.use(express.json());

  const { default: cartRoutes } = await import('../../routes/cart.js');
  app.use('/api/cart', cartRoutes);
});

describe('Cart Routes', () => {
  it('should handle GET /api/cart/:userId', async () => {
    (cartController.getCart as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ cart: [] });
    });

    const response = await request(app).get('/api/cart/user123');

    expect(response.status).toBe(200);
    expect(cartController.getCart).toHaveBeenCalled();
  });

  it('should handle POST /api/cart/:userId (add to cart)', async () => {
    (cartController.addToCart as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Item added to cart' });
    });

    const response = await request(app)
      .post('/api/cart/user123')
      .send({ productId: 'product123', quantity: 1 });

    expect(response.status).toBe(200);
    expect(cartController.addToCart).toHaveBeenCalled();
  });

  it('should handle PUT /api/cart/:userId/item/:productId (update cart item)', async () => {
    (cartController.updateCartItem as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Cart item updated' });
    });

    const response = await request(app)
      .put('/api/cart/user123/item/product123')
      .send({ quantity: 2 });

    expect(response.status).toBe(200);
    expect(cartController.updateCartItem).toHaveBeenCalled();
  });

  it('should handle DELETE /api/cart/:userId/item/:productId (remove from cart)', async () => {
    (cartController.removeFromCart as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Item removed from cart' });
    });

    const response = await request(app).delete('/api/cart/user123/item/product123');

    expect(response.status).toBe(200);
    expect(cartController.removeFromCart).toHaveBeenCalled();
  });

  it('should handle DELETE /api/cart/:userId (clear cart)', async () => {
    (cartController.clearCart as any).mockImplementation((req: any, res: any) => {
      res.status(200).json({ message: 'Cart cleared' });
    });

    const response = await request(app).delete('/api/cart/user123');

    expect(response.status).toBe(200);
    expect(cartController.clearCart).toHaveBeenCalled();
  });
});
