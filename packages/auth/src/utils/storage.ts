/**
 * 跨平台存储抽象
 * 支持 web (localStorage) 和 React Native (AsyncStorage)
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Web 存储适配器 (localStorage)
 */
class WebStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      // 忽略存储错误
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch {
      // 忽略删除错误
    }
  }
}

/**
 * React Native 存储适配器 (AsyncStorage)
 * 需要在使用时传入 AsyncStorage 实例
 */
class ReactNativeStorageAdapter implements StorageAdapter {
  private storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };

  constructor(storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }) {
    this.storage = storage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.storage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.storage.setItem(key, value);
    } catch {
      // 忽略存储错误
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.storage.removeItem(key);
    } catch {
      // 忽略删除错误
    }
  }
}

/**
 * 存储管理器
 */
class StorageManager {
  private adapter: StorageAdapter;

  constructor(adapter?: StorageAdapter) {
    if (adapter) {
      this.adapter = adapter;
    } else {
      // 自动检测环境
      if (typeof window !== 'undefined' && window.localStorage) {
        this.adapter = new WebStorageAdapter();
      } else {
        throw new Error(
          'Storage adapter is required for React Native. Please provide AsyncStorage instance.'
        );
      }
    }
  }

  /**
   * 设置 React Native 存储适配器
   */
  setReactNativeAdapter(storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }): void {
    this.adapter = new ReactNativeStorageAdapter(storage);
  }

  async getItem(key: string): Promise<string | null> {
    return this.adapter.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.adapter.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return this.adapter.removeItem(key);
  }

  /**
   * 获取 JSON 对象
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.getItem(key);
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * 设置 JSON 对象
   */
  async setJSON(key: string, value: unknown): Promise<void> {
    return this.setItem(key, JSON.stringify(value));
  }
}

// 导出单例实例
export const storage = new StorageManager();

// 导出类以便自定义
export { StorageManager, WebStorageAdapter, ReactNativeStorageAdapter };
