import { vi } from 'vitest';

/**
 * API 应用的通用 Vitest 设置
 * 包括常见的 Mock 和配置
 */
export function setupApiTests() {
  // 设置环境变量
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-secret';
  }

  // Mock 全局 fetch（如果需要）
  global.fetch = vi.fn();

  // Mock console 方法以减少测试中的噪音
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
}

/**
 * 清除所有 API 测试 Mock
 */
export function teardownApiTests() {
  vi.clearAllMocks();
}

/**
 * 设置测试环境变量
 */
export function setTestEnvVars(vars: Record<string, string>) {
  Object.assign(process.env, vars);
}

/**
 * 清除测试环境变量
 */
export function clearTestEnvVars(keys: string[]) {
  keys.forEach((key) => {
    delete process.env[key];
  });
}
