import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../../models/User';
import * as userController from '../../controllers/userController';

// 模拟 Express 的 Request 和 Response 对象
const mockRequest = (body: any = {}, params: any = {}) =>
  ({
    body,
    params,
  }) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe('用户控制器', () => {
  let mongoServer: MongoMemoryServer;

  // 在每个测试前连接测试数据库
  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    await User.deleteMany({});
  });

  // 在每个测试后断开数据库连接
  afterEach(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const req = mockRequest({
        firstName: 'testuser',
        lastName: 'testuser',
        password: 'password123',
        email: 'test@example2.com',
        phone: '12345678902',
      });
      const res = mockResponse();

      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'testuser',
          lastName: 'testuser',
          role: 'user',
          email: 'test@example2.com',
          phone: '12345678902',
        })
      );
    });

    it('应该拒绝重复的用户名', async () => {
      // 先创建一个用户
      await User.create({
        firstName: 'existinguser',
        lastName: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });

      const req = mockRequest({
        firstName: 'existinguser',
        lastName: 'existinguser',
        email: 'new@example.com',
        password: 'password123',
      });
      const res = mockResponse();

      await userController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '用户名或邮箱已被使用' });
    });
  });

  describe('login', () => {
    it('应该成功登录', async () => {
      // 先创建一个用户
      await User.create({
        firstName: 'testuser',
        lastName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const req = mockRequest({
        firstName: 'testuser',
        lastName: 'testuser',
        password: 'password123',
      });
      const res = mockResponse();

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'testuser',
          lastName: 'testuser',
          email: 'test@example.com',
          role: 'user',
        })
      );
    });

    it('应该拒绝错误的密码', async () => {
      // 先创建一个用户
      await User.create({
        firstName: 'testuser',
        lastName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const req = mockRequest({
        firstName: 'testuser',
        lastName: 'testuser',
        password: 'wrongpassword',
      });
      const res = mockResponse();

      await userController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: '用户名或密码错误' });
    });
  });

  describe('getUserById', () => {
    it('应该成功获取用户信息', async () => {
      // 先创建一个用户
      const user = await User.create({
        firstName: 'testuser',
        lastName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const req = mockRequest({}, { id: user._id.toString() });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'testuser',
          lastName: 'testuser',
          email: 'test@example.com',
        })
      );
    });

    it('应该处理不存在的用户', async () => {
      const req = mockRequest({}, { id: new mongoose.Types.ObjectId().toString() });
      const res = mockResponse();

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: '用户不存在' });
    });
  });

  describe('updateUser', () => {
    it('应该成功更新用户信息', async () => {
      // 先创建一个用户
      const user = await User.create({
        firstName: 'testuser',
        lastName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const req = mockRequest(
        {
          firstName: 'newusername',
          lastName: 'newusername',
          email: 'new@example.com',
        },
        { id: user._id.toString() }
      );
      const res = mockResponse();

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'newusername',
          lastName: 'newusername',
          email: 'new@example.com',
        })
      );
    });

    it('应该拒绝重复的用户名', async () => {
      // 创建两个用户
      await User.create({
        firstName: 'existinguser',
        lastName: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });
      const user2 = await User.create({
        firstName: 'testuser',
        lastName: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const req = mockRequest(
        {
          firstName: 'existinguser',
          lastName: 'existinguser',
        },
        { id: user2._id.toString() }
      );
      const res = mockResponse();

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: '用户名已被使用' });
    });
  });
});
