import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { adminAuth } from '../../middleware/adminAuth';

describe('adminAuth middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;
  let originalEnv: any;

  beforeEach(() => {
    // 保存原始环境变量
    originalEnv = process.env.ADMIN_SECRET;

    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复原始环境变量
    if (originalEnv !== undefined) {
      process.env.ADMIN_SECRET = originalEnv;
    } else {
      delete process.env.ADMIN_SECRET;
    }
  });

  it('should return 500 if ADMIN_SECRET env var is not set', async () => {
    delete process.env.ADMIN_SECRET;

    await adminAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: '服务器配置错误' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if no admin-secret header provided', async () => {
    process.env.ADMIN_SECRET = 'test-secret';

    await adminAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: '没有管理员权限' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if admin-secret is invalid', async () => {
    process.env.ADMIN_SECRET = 'test-secret';
    mockReq.headers['admin-secret'] = 'invalid-secret';

    await adminAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: '没有管理员权限' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next if admin-secret is valid', async () => {
    process.env.ADMIN_SECRET = 'test-secret';
    mockReq.headers['admin-secret'] = 'test-secret';

    await adminAuth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it('should handle empty admin-secret header', async () => {
    process.env.ADMIN_SECRET = 'test-secret';
    mockReq.headers['admin-secret'] = '';

    await adminAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: '没有管理员权限' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle case sensitivity correctly', async () => {
    process.env.ADMIN_SECRET = 'test-secret';
    mockReq.headers['admin-secret'] = 'Test-Secret'; // Different case

    await adminAuth(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ message: '没有管理员权限' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
