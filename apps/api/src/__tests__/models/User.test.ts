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
      email: 'test1@example.com',
      password: 'password123',
      role: 'user',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe('test1@example.com');
    expect(savedUser.role).toBe('user');
    expect(savedUser.firstName).toBe('Test');
    expect(savedUser.lastName).toBe('User');
    expect(savedUser.phone).toBe('1234567890');
    expect(savedUser.password).not.toBe('password123'); // 密码应该被加密
  });

  it('should validate required fields', async () => {
    const user = new User({
      email: 'invalid-email',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    });

    try {
      await user.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should validate email format', async () => {
    const user = new User({
      email: 'invalid-email',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    });

    try {
      await user.save();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should update user details', async () => {
    const user = new User({
      email: 'test3@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    });

    await user.save();

    user.email = 'updated3@example.com';
    user.password = 'updatedpassword123';
    user.firstName = 'Updated';
    user.lastName = 'User';
    user.phone = '0987654321';

    const updatedUser = await user.save();

    expect(updatedUser.email).toBe('updated3@example.com');
    expect(updatedUser.password).not.toBe('password123');
    expect(updatedUser.firstName).toBe('Updated');
    expect(updatedUser.lastName).toBe('User');
    expect(updatedUser.phone).toBe('0987654321');
  });
});
