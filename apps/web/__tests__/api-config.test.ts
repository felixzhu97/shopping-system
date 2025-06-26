import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_API_URL: 'https://api.test.com',
  NODE_ENV: 'test',
};

vi.stubGlobal('process', {
  env: mockEnv,
});

describe('API Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have API configuration object', async () => {
    const { API_CONFIG } = await import('../lib/api/config');
    expect(API_CONFIG).toBeDefined();
    expect(API_CONFIG.baseUrl).toBeDefined();
    expect(typeof API_CONFIG.baseUrl).toBe('string');
  });

  it('should have category mapping configuration', async () => {
    const { CATEGORY_MAPPING } = await import('../lib/api/config');
    expect(CATEGORY_MAPPING).toBeDefined();
    expect(CATEGORY_MAPPING.electronics).toBe('Electronics');
    expect(CATEGORY_MAPPING.clothing).toBe('Clothing');
  });

  it('should have fetchApi function available', async () => {
    const { fetchApi } = await import('../lib/api/config');
    expect(fetchApi).toBeDefined();
    expect(typeof fetchApi).toBe('function');
  });

  it('should handle API requests with proper headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { fetchApi } = await import('../lib/api/config');
    await fetchApi('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle POST requests with body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { fetchApi } = await import('../lib/api/config');
    const testData = { name: 'test' };

    await fetchApi('/test', {
      method: 'POST',
      body: JSON.stringify(testData),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(testData),
      })
    );
  });
});
