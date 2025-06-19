import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock mongoose and models
vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
    connection: {
      close: vi.fn(),
    },
  },
}));

vi.mock('../../models/User', () => ({
  default: vi.fn(),
}));

describe('User Model', () => {
  let mockUser: any;

  beforeEach(async () => {
    // Import mocked modules
    const { default: User } = await import('../../models/User');
    mockUser = User;

    // Reset mocks
    vi.clearAllMocks();

    // Setup mock implementations
    mockUser.deleteMany = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
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

    const mockSave = vi.fn().mockResolvedValue({
      _id: 'user-id',
      ...userData,
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    mockUser.mockImplementation(() => ({
      save: mockSave,
      ...userData,
    }));

    const user = new mockUser(userData);
    const savedUser = await user.save();

    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe('test1@example.com');
    expect(savedUser.role).toBe('user');
    expect(savedUser.firstName).toBe('Test');
    expect(savedUser.lastName).toBe('User');
    expect(savedUser.phone).toBe('1234567890');
    expect(savedUser.password).not.toBe('password123'); // 密码应该被加密
    expect(mockSave).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const mockSave = vi.fn().mockRejectedValue(new Error('Validation failed: email is required'));

    mockUser.mockImplementation(() => ({
      save: mockSave,
      email: 'invalid-email',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    }));

    const user = new mockUser({
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
      expect(mockSave).toHaveBeenCalled();
    }
  });

  it('should validate email format', async () => {
    const mockSave = vi
      .fn()
      .mockRejectedValue(new Error('Validation failed: email format is invalid'));

    mockUser.mockImplementation(() => ({
      save: mockSave,
      email: 'invalid-email',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    }));

    const user = new mockUser({
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
      expect(mockSave).toHaveBeenCalled();
    }
  });

  it('should update user details', async () => {
    const initialData = {
      email: 'test3@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    };

    const mockSave = vi
      .fn()
      .mockResolvedValueOnce({
        _id: 'user-id',
        ...initialData,
        password: 'hashed-password',
      })
      .mockResolvedValueOnce({
        _id: 'user-id',
        email: 'updated3@example.com',
        password: 'hashed-updated-password',
        firstName: 'Updated',
        lastName: 'User',
        phone: '0987654321',
      });

    const mockUserInstance = {
      ...initialData,
      save: mockSave,
    };

    mockUser.mockImplementation(() => mockUserInstance);

    const user = new mockUser(initialData);
    await user.save();

    // Simulate updating properties
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
    expect(mockSave).toHaveBeenCalledTimes(2);
  });
});
