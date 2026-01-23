import { describe, it, expect, beforeEach } from 'vitest';
import { createEncryptedStorage } from '../../storage/encrypt-storage';
import type { StorageAdapter } from '../../types';

describe('Encrypted Storage', () => {
  const encryptionKey = 'test-encryption-key-12345';
  let storage: StorageAdapter;

  let memoryStore: Record<string, string>;
  let memoryStorage: StorageAdapter;

  beforeEach(() => {
    // 创建内存存储用于测试
    memoryStore = {};
    memoryStorage = {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, value: string) => {
        memoryStore[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStore[key];
      },
      clear: () => {
        Object.keys(memoryStore).forEach(key => delete memoryStore[key]);
      },
      get length() {
        return Object.keys(memoryStore).length;
      },
      key: (index: number) => {
        const keys = Object.keys(memoryStore);
        return keys[index] || null;
      },
    };

    storage = createEncryptedStorage({
      encryptionKey,
      storage: memoryStorage,
    });
  });

  describe('createEncryptedStorage()', () => {
    it('should create encrypted storage adapter', () => {
      expect(storage).toBeTruthy();
      expect(typeof storage.getItem).toBe('function');
      expect(typeof storage.setItem).toBe('function');
      expect(typeof storage.removeItem).toBe('function');
    });

    it('should accept string as encryption key (backward compatibility)', () => {
      const storage2 = createEncryptedStorage(encryptionKey);
      expect(storage2).toBeTruthy();
    });

    it('should throw error if encryption key is missing', () => {
      expect(() => createEncryptedStorage({ encryptionKey: '' })).toThrow();
    });
  });

  describe('setItem and getItem', () => {
    it('should encrypt data when storing', () => {
      const testValue = 'test-value';
      storage.setItem('test-key', testValue);

      // 验证底层存储中的数据是加密的
      const rawValue = memoryStorage.getItem('test-key');
      expect(rawValue).toBeTruthy();
      expect(rawValue).not.toBe(testValue);

      // 验证通过加密存储可以正确解密
      const retrieved = storage.getItem('test-key');
      expect(retrieved).toBe(testValue);
    });

    it('should decrypt data when retrieving', () => {
      const testValue = 'Hello, World! 测试';
      storage.setItem('test-key', testValue);
      const retrieved = storage.getItem('test-key');
      expect(retrieved).toBe(testValue);
    });

    it('should handle empty string', () => {
      storage.setItem('empty-key', '');
      expect(storage.getItem('empty-key')).toBe('');
    });

    it('should handle JSON data', () => {
      const jsonData = JSON.stringify({ name: 'test', value: 123 });
      storage.setItem('json-key', jsonData);
      const retrieved = storage.getItem('json-key');
      expect(retrieved).toBe(jsonData);
      expect(JSON.parse(retrieved!)).toEqual({ name: 'test', value: 123 });
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', () => {
      storage.setItem('test-key', 'test-value');
      storage.removeItem('test-key');
      expect(storage.getItem('test-key')).toBeNull();
    });
  });
});
