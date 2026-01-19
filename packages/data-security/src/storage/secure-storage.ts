import type { StorageAdapter } from '../types';

/**
 * 检查是否为浏览器环境
 */
function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * 获取默认存储适配器（浏览器环境使用 localStorage）
 * @returns 存储适配器
 */
function getDefaultStorage(): StorageAdapter | null {
  if (isBrowserEnvironment()) {
    return window.localStorage;
  }
  return null;
}

/**
 * 创建一个简单的内存存储适配器（用于 Node.js 环境测试）
 */
function createMemoryStorage(): StorageAdapter {
  const store: Record<string, string> = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * 创建安全存储适配器的选项
 */
export interface SecureStorageOptions {
  /**
   * 底层存储适配器（浏览器环境默认为 localStorage）
   */
  storage?: StorageAdapter;
}

/**
 * 创建安全存储适配器
 * 在浏览器环境中，默认使用 localStorage
 * 在 Node.js 环境中，可以使用自定义存储适配器或内存存储
 * @param options 选项
 * @returns 存储适配器
 */
export function createSecureStorage(options: SecureStorageOptions = {}): StorageAdapter {
  const { storage } = options;

  if (storage) {
    return storage;
  }

  const defaultStorage = getDefaultStorage();
  if (defaultStorage) {
    return defaultStorage;
  }

  // Node.js 环境：返回内存存储（仅用于测试，不建议生产使用）
  return createMemoryStorage();
}
