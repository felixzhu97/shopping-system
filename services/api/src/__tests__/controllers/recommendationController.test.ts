import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response } from 'express';
import { getRecommendationsByProductId } from '../../controllers/recommendationController';
import Product from '../../models/Product';

vi.mock('../../models/Product');

const mockProductModel = Product as any;

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
}

describe('Recommendation Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Response;

  beforeEach(() => {
    mockReq = { params: {}, query: {} };
    mockRes = createRes();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 404 when seed product does not exist', async () => {
    mockReq.params = { productId: 'missing' };
    mockProductModel.find = vi.fn().mockResolvedValue([
      { toJSON: () => ({ id: 'p1', name: 'A', description: 'A', category: 'Electronics', inStock: true }) },
    ]);

    await getRecommendationsByProductId(mockReq as Request, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('should return recommendations for existing seed product', async () => {
    mockReq.params = { productId: 'p1' };
    mockReq.query = { limit: '2' };
    mockProductModel.find = vi.fn().mockResolvedValue([
      { toJSON: () => ({ id: 'p1', name: 'Wireless Mouse', description: 'Bluetooth mouse', category: 'Electronics', rating: 4.5, reviewCount: 20, inStock: true }) },
      { toJSON: () => ({ id: 'p2', name: 'Gaming Mouse', description: 'USB gaming mouse', category: 'Electronics', rating: 4.7, reviewCount: 50, inStock: true }) },
      { toJSON: () => ({ id: 'p3', name: 'Cooking Pan', description: 'Non-stick pan', category: 'Home & Kitchen', rating: 4.2, reviewCount: 10, inStock: true }) },
    ]);

    await getRecommendationsByProductId(mockReq as Request, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const payload = (mockRes.json as any).mock.calls[0][0];
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBe(2);
    expect(payload.find((p: any) => p.id === 'p1')).toBeUndefined();
  });

  it('should handle errors', async () => {
    mockReq.params = { productId: 'p1' };
    mockProductModel.find = vi.fn().mockRejectedValue(new Error('db'));

    await getRecommendationsByProductId(mockReq as Request, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to get recommendations' });
  });
});
