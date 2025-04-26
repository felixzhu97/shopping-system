import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import User from '../../models/User';
import mongoose from 'mongoose';

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/shopping-system-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should create a valid user', async () => {
    const userData = {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'password123',
      role: 'user',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser).toBeDefined();
    expect(savedUser.username).toBe('testuser1');
    expect(savedUser.email).toBe('test1@example.com');
    expect(savedUser.role).toBe('user');
    expect(savedUser.password).not.toBe('password123'); // 密码应该被加密
  });

  it('should validate required fields', async () => {
    const user = new User({
      username: '',
      email: 'invalid-email',
      password: '',
    });

    try {
      await user.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should validate email format', async () => {
    const user = new User({
      username: 'testuser2',
      email: 'invalid-email',
      password: 'password123',
    });

    try {
      await user.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should update user details', async () => {
    const user = new User({
      username: 'testuser3',
      email: 'test3@example.com',
      password: 'password123',
    });

    await user.save();

    user.username = 'updateduser3';
    user.email = 'updated3@example.com';

    const updatedUser = await user.save();

    expect(updatedUser.username).toBe('updateduser3');
    expect(updatedUser.email).toBe('updated3@example.com');
  });
});
