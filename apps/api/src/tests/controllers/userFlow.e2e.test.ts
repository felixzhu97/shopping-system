import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../index'; // 请确保你的 express 实例是 export default app

describe('用户注册-登录-获取信息流程', () => {
  let mongoServer: MongoMemoryServer;
  let server: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'test_secret'; // 保证 token 生成和校验一致
    server = app.listen(); // 启动 express
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    server.close();
  });

  it('完整流程：注册-登录-获取用户信息', async () => {
    // 注册
    const registerRes = await request(server).post('/api/users/register').send({
      email: 'testuser@example.com',
      password: 'password123',
      firstName: '测试',
      lastName: '用户',
      phone: '12345678901',
    });
    if (registerRes.status !== 201) {
      console.log('注册失败:', registerRes.status, registerRes.body);
    }
    expect(registerRes.status).toBe(201);

    // 登录
    const loginRes = await request(server).post('/api/users/login').send({
      emailOrPhone: 'testuser@example.com',
      password: 'password123',
    });
    expect(loginRes.status).toBe(200);
    const { token, id } = loginRes.body;

    // 获取用户信息
    const userInfoRes = await request(server)
      .get(`/api/users/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(userInfoRes.status).toBe(200);
    expect(userInfoRes.body.email).toBe('testuser@example.com');
  });
});
