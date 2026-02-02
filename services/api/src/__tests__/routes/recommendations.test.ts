import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../../controllers/recommendationController', () => ({
  getRecommendationsByProductId: vi.fn(),
}));

import * as recommendationController from '../../controllers/recommendationController';

let app: express.Application;

beforeEach(async () => {
  vi.clearAllMocks();
  app = express();
  app.use(express.json());
  const { default: recommendationRoutes } = await import('../../routes/recommendations.js');
  app.use('/api/recommendations', recommendationRoutes);
});

describe('Recommendations Routes', () => {
  it('should handle GET /api/recommendations/:productId', async () => {
    (recommendationController.getRecommendationsByProductId as any).mockImplementation(
      (req: any, res: any) => {
        res.status(200).json([{ id: 'p2' }]);
      }
    );

    const response = await request(app).get('/api/recommendations/p1?limit=4');
    expect(response.status).toBe(200);
    expect(recommendationController.getRecommendationsByProductId).toHaveBeenCalled();
  });
});
