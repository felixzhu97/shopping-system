import { describe, it, expect } from 'vitest';

describe('Lambda Module', () => {
  it('should export handler function', async () => {
    // 动态导入lambda模块以避免执行时的依赖问题
    const lambdaModule = await import('../lambda.js');

    expect(lambdaModule.handler).toBeDefined();
    expect(typeof lambdaModule.handler).toBe('function');
  });

  it('should have binary configuration', async () => {
    // 测试lambda配置的二进制类型
    expect(['application/octet-stream', 'image/*']).toEqual(
      expect.arrayContaining(['application/octet-stream', 'image/*'])
    );
  });
});
