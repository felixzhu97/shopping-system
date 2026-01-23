import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetchApi
vi.mock('../lib/api/config', () => ({
  API_CONFIG: {
    usersUrl: '/api/users',
  },
  fetchApi: vi.fn(),
}));

// Mock userStore
vi.mock('../lib/store/userStore', () => ({
  clearUserStore: vi.fn(),
}));

describe('Users API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      token: 'mock-token',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockUser,
    });

    const { login } = await import('../lib/api/users');
    const result = await login({
      emailOrPhone: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockUser);
    expect(fetchApi).toHaveBeenCalledWith('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: 'test@example.com',
        password: 'password123',
      }),
    });
  });

  it('should register user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
    };

    const mockRegisteredUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      token: 'mock-token',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockRegisteredUser,
    });

    const { register } = await import('../lib/api/users');
    const result = await register(userData);

    expect(result).toEqual(mockRegisteredUser);
    expect(fetchApi).toHaveBeenCalledWith('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  });

  it('should get user by ID successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockUser,
    });

    const { getUserById } = await import('../lib/api/users');
    const result = await getUserById('user-1');

    expect(result).toEqual(mockUser);
    expect(fetchApi).toHaveBeenCalledWith('/api/users/user-1');
  });

  it('should update user successfully', async () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
    };

    const mockUpdatedUser = {
      id: 'user-1',
      email: 'updated@example.com',
      firstName: 'Updated',
      lastName: 'Name',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockUpdatedUser,
    });

    const { updateUser } = await import('../lib/api/users');
    const result = await updateUser('user-1', updateData);

    expect(result).toEqual(mockUpdatedUser);
    expect(fetchApi).toHaveBeenCalledWith('/api/users/user-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
  });

  it('should reset password successfully', async () => {
    const resetData = {
      emailOrPhone: 'test@example.com',
      newPassword: 'newPassword123',
    };

    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: true,
      data: mockUser,
    });

    const { resetPassword } = await import('../lib/api/users');
    const result = await resetPassword(resetData);

    expect(result).toEqual(mockUser);
    expect(fetchApi).toHaveBeenCalledWith('/api/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resetData),
    });
  });

  it('should handle API errors gracefully', async () => {
    const { fetchApi } = await import('../lib/api/config');
    vi.mocked(fetchApi).mockRejectedValueOnce(new Error('Network error'));

    const { login } = await import('../lib/api/users');

    await expect(
      login({
        emailOrPhone: 'test@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Network error');
  });

  it('should clear user store when get user fails', async () => {
    const { fetchApi } = await import('../lib/api/config');
    const { clearUserStore } = await import('../lib/store/userStore');

    vi.mocked(fetchApi).mockResolvedValueOnce({
      success: false,
      data: null,
    });

    const { getUserById } = await import('../lib/api/users');

    await expect(getUserById('user-1')).rejects.toThrow('获取用户信息失败');
    expect(clearUserStore).toHaveBeenCalled();
  });
});
