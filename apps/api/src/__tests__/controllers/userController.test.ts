import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock process.env first
process.env.JWT_SECRET = 'test-secret';

// Mock models and jwt before importing anything else
vi.mock('../../models/User', () => ({
  default: vi.fn(),
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

// Mock the index.ts to prevent route loading
vi.mock('../../index', () => ({
  getJwtSecret: () => 'test-secret',
}));

// Import after mocks are set up
import {
  register,
  login,
  getUserById,
  updateUser,
  resetPassword,
} from '../../controllers/userController';

describe('User Controller', () => {
  let mockReq: any;
  let mockRes: any;
  let mockUser: any;
  let mockJwt: any;

  beforeEach(async () => {
    mockReq = {
      body: {},
      params: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Import the mocked modules
    const { default: User } = await import('../../models/User.js');
    const { default: jwt } = await import('jsonwebtoken');

    mockUser = User;
    mockJwt = jwt.sign;

    // Reset mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    mockUser.findOne = vi.fn();
    mockUser.findById = vi.fn();
    mockUser.findByIdAndUpdate = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      mockReq.body = userData;

      mockUser.findOne.mockResolvedValue(null);
      const mockSave = vi.fn().mockResolvedValue({
        _id: 'user-id',
        email: userData.email,
        role: 'user',
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });

      mockUser.mockImplementation(() => ({
        save: mockSave,
        _id: 'user-id',
        email: userData.email,
        role: 'user',
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      }));

      await register(mockReq, mockRes);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        $or: [{ email: userData.email }, { phone: userData.phone }],
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'user-id',
        email: userData.email,
        role: 'user',
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });
    });

    it('should return error if email or phone already exists', async () => {
      mockReq.body = {
        email: 'existing@example.com',
        phone: '1234567890',
      };

      mockUser.findOne.mockResolvedValue({ _id: 'existing-user' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '邮箱或手机号已被使用',
      });
    });

    it('should return error for invalid email format', async () => {
      mockReq.body = {
        email: 'invalid-email',
        password: 'password123',
      };

      mockUser.findOne.mockResolvedValue(null);

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '请输入有效的邮箱地址',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        emailOrPhone: 'test@example.com',
        password: 'password123',
      };

      mockReq.body = loginData;

      const mockUserDoc = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        comparePassword: vi.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(mockUserDoc);
      mockJwt.mockReturnValue('jwt-token');

      await login(mockReq, mockRes);

      expect(mockUser.findOne).toHaveBeenCalled();
      expect(mockUserDoc.comparePassword).toHaveBeenCalledWith(loginData.password);
      expect(mockJwt).toHaveBeenCalledWith({ id: 'user-id', role: 'user' }, 'test-secret', {
        expiresIn: '7d',
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        token: 'jwt-token',
      });
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        emailOrPhone: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUser.findOne.mockResolvedValue(null);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '账号或密码错误，请重新输入',
      });
    });

    it('should return error for invalid password', async () => {
      mockReq.body = {
        emailOrPhone: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUserDoc = {
        _id: 'user-id',
        email: 'test@example.com',
        comparePassword: vi.fn().mockResolvedValue(false),
      };

      mockUser.findOne.mockResolvedValue(mockUserDoc);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '账号或密码错误，请重新输入',
      });
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      mockReq.params = { id: 'user-id' };

      const mockUserDoc = {
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        toObject: vi.fn().mockReturnValue({
          _id: 'user-id',
          email: 'test@example.com',
          role: 'user',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        }),
      };

      const mockQuery = {
        select: vi.fn().mockResolvedValue(mockUserDoc),
      };

      mockUser.findById.mockReturnValue(mockQuery);

      await getUserById(mockReq, mockRes);

      expect(mockUser.findById).toHaveBeenCalledWith('user-id');
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: 'user-id',
        email: 'test@example.com',
        role: 'user',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        address: '',
        city: '',
        province: '',
        postalCode: '',
        paymentMethod: '',
      });
    });

    it('should return error for non-existent user', async () => {
      mockReq.params = { id: 'non-existent-id' };

      const mockQuery = {
        select: vi.fn().mockResolvedValue(null),
      };

      mockUser.findById.mockReturnValue(mockQuery);

      await getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '用户不存在',
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      mockReq.params = { id: 'user-id' };
      mockReq.body = {
        firstName: 'Jane',
        lastName: 'Smith',
        address: '123 Main St',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
        paymentMethod: 'credit-card',
      };

      const existingUser = {
        _id: 'user-id',
        email: 'test@example.com',
        phone: '1234567890',
      };

      const updatedUser = {
        _id: 'user-id',
        email: 'test@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        province: 'NY',
        postalCode: '10001',
        paymentMethod: 'credit-card',
      };

      mockUser.findById.mockResolvedValue(existingUser);

      const mockQuery = {
        select: vi.fn().mockResolvedValue(updatedUser),
      };

      mockUser.findByIdAndUpdate.mockReturnValue(mockQuery);

      await updateUser(mockReq, mockRes);

      expect(mockUser.findById).toHaveBeenCalledWith('user-id');
      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-id',
        {
          firstName: 'Jane',
          lastName: 'Smith',
          address: '123 Main St',
          city: 'New York',
          province: 'NY',
          postalCode: '10001',
          paymentMethod: 'credit-card',
        },
        { new: true }
      );
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return error for non-existent user', async () => {
      mockReq.params = { id: 'non-existent-id' };
      mockReq.body = { firstName: 'Jane' };

      mockUser.findById.mockResolvedValue(null);

      await updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '用户不存在',
      });
    });

    it('should return error for duplicate phone number', async () => {
      mockReq.params = { id: 'user-id' };
      mockReq.body = { phone: '9876543210' };

      const existingUser = {
        _id: 'user-id',
        phone: '1234567890',
      };

      const duplicatePhoneUser = {
        _id: 'other-user-id',
        phone: '9876543210',
      };

      mockUser.findById.mockResolvedValue(existingUser);
      mockUser.findOne.mockResolvedValue(duplicatePhoneUser);

      await updateUser(mockReq, mockRes);

      expect(mockUser.findOne).toHaveBeenCalledWith({ phone: '9876543210' });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '手机号已被使用',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockReq.body = {
        emailOrPhone: 'test@example.com',
        newPassword: 'newpassword123',
      };

      const existingUser = {
        _id: 'user-id',
        email: 'test@example.com',
        password: 'oldpassword',
        save: vi.fn().mockResolvedValue(true),
      };

      mockUser.findOne.mockResolvedValue(existingUser);

      await resetPassword(mockReq, mockRes);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { phone: 'test@example.com' }],
      });
      expect(existingUser.password).toBe('newpassword123');
      expect(existingUser.save).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '密码更新成功',
      });
    });

    it('should return error for non-existent user', async () => {
      mockReq.body = {
        emailOrPhone: 'nonexistent@example.com',
        newPassword: 'newpassword123',
      };

      mockUser.findOne.mockResolvedValue(null);

      await resetPassword(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: '邮箱或手机号不存在',
      });
    });
  });
});
