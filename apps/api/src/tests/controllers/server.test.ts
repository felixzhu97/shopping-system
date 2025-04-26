import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import cors from 'cors';

// 创建一个简化版的express应用用于测试
const createTestApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // 添加一个测试路由
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
};

describe('API服务器', () => {
  let app: any;

  beforeAll(() => {
    app = createTestApp();
  });

  it('健康检查端点返回200状态码', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('处理不存在的路由', async () => {
    const response = await request(app).get('/api/not-exists');
    expect(response.status).toBe(404);
  });
});
