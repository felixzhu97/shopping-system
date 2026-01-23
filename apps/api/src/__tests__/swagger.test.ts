import { describe, it, expect } from 'vitest';
import swaggerSpecs from '../swagger';

describe('Swagger Configuration', () => {
  it('should export swagger specs', () => {
    expect(swaggerSpecs).toBeDefined();
    expect(typeof swaggerSpecs).toBe('object');
  });

  it('should have correct OpenAPI version', () => {
    expect((swaggerSpecs as any).openapi).toBe('3.0.0');
  });

  it('should have API info', () => {
    expect((swaggerSpecs as any).info).toBeDefined();
    expect((swaggerSpecs as any).info.title).toBe('购物系统 API');
    expect((swaggerSpecs as any).info.version).toBe('1.0.0');
    expect((swaggerSpecs as any).info.description).toBe('购物系统的API文档');
  });

  it('should have servers configuration', () => {
    expect((swaggerSpecs as any).servers).toBeDefined();
    expect(Array.isArray((swaggerSpecs as any).servers)).toBe(true);
    expect((swaggerSpecs as any).servers.length).toBeGreaterThan(0);

    const server = (swaggerSpecs as any).servers[0];
    expect(server.url).toBe('http://localhost:3001');
    expect(server.description).toBe('开发服务器');
  });

  it('should have security schemes', () => {
    expect((swaggerSpecs as any).components).toBeDefined();
    expect((swaggerSpecs as any).components.securitySchemes).toBeDefined();
    expect((swaggerSpecs as any).components.securitySchemes.adminSecret).toBeDefined();

    const adminSecret = (swaggerSpecs as any).components.securitySchemes.adminSecret;
    expect(adminSecret.type).toBe('apiKey');
    expect(adminSecret.in).toBe('header');
    expect(adminSecret.name).toBe('admin-secret');
  });

  it('should have paths from route documentation', () => {
    expect((swaggerSpecs as any).paths).toBeDefined();
    expect(typeof (swaggerSpecs as any).paths).toBe('object');
  });
});
