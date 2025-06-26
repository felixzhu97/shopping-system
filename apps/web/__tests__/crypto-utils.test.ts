import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock crypto-js
vi.mock('crypto-js', () => ({
  default: {
    AES: {
      encrypt: vi.fn(),
      decrypt: vi.fn(),
    },
    enc: {
      Utf8: {},
    },
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Crypto Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should encrypt data', async () => {
    const CryptoJS = (await import('crypto-js')).default;
    vi.mocked(CryptoJS.AES.encrypt).mockReturnValue({
      toString: () => 'encrypted-data',
    } as any);

    const { encrypt } = await import('../lib/utils/crypto');
    const result = encrypt('test data');

    expect(result).toBe('encrypted-data');
    expect(CryptoJS.AES.encrypt).toHaveBeenCalledWith('test data', expect.any(String));
  });

  it('should decrypt data', async () => {
    const CryptoJS = (await import('crypto-js')).default;
    vi.mocked(CryptoJS.AES.decrypt).mockReturnValue({
      toString: () => 'test data',
    } as any);

    const { decrypt } = await import('../lib/utils/crypto');
    const result = decrypt('encrypted-data');

    expect(result).toBe('test data');
    expect(CryptoJS.AES.decrypt).toHaveBeenCalledWith('encrypted-data', expect.any(String));
  });

  it('should provide encrypted storage interface', async () => {
    const CryptoJS = (await import('crypto-js')).default;

    // Mock encrypt/decrypt for storage operations
    vi.mocked(CryptoJS.AES.encrypt).mockReturnValue({
      toString: () => 'encrypted-value',
    } as any);

    vi.mocked(CryptoJS.AES.decrypt).mockReturnValue({
      toString: () => 'decrypted-value',
    } as any);

    const { encryptedStorage } = await import('../lib/utils/crypto');

    // Test setItem
    encryptedStorage.setItem('test-key', 'test-value');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'encrypted-value');

    // Test getItem with existing data
    mockLocalStorage.getItem.mockReturnValue('encrypted-stored-value');
    const result = encryptedStorage.getItem('test-key');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(result).toBe('decrypted-value');

    // Test getItem with no data
    mockLocalStorage.getItem.mockReturnValue(null);
    const nullResult = encryptedStorage.getItem('missing-key');
    expect(nullResult).toBeNull();

    // Test removeItem
    encryptedStorage.removeItem('test-key');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should handle decryption errors gracefully', async () => {
    const CryptoJS = (await import('crypto-js')).default;
    vi.mocked(CryptoJS.AES.decrypt).mockImplementation(() => {
      throw new Error('Decryption failed');
    });

    mockLocalStorage.getItem.mockReturnValue('invalid-encrypted-data');

    const { encryptedStorage } = await import('../lib/utils/crypto');
    const result = encryptedStorage.getItem('test-key');

    expect(result).toBeNull();
  });

  it('should handle missing localStorage', async () => {
    // Temporarily remove localStorage
    const originalLocalStorage = global.localStorage;
    delete (global as any).localStorage;

    const { encryptedStorage } = await import('../lib/utils/crypto');

    // These should not throw errors
    expect(() => encryptedStorage.setItem('key', 'value')).not.toThrow();
    expect(() => encryptedStorage.removeItem('key')).not.toThrow();
    expect(encryptedStorage.getItem('key')).toBeNull();

    // Restore localStorage
    global.localStorage = originalLocalStorage;
  });
});
