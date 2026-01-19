import { aesEncrypt, aesDecrypt } from '../encryption/aes';
import type { StorageAdapter, AESOptions, EncryptedStorageOptions } from '../types';
import { createSecureStorage } from './secure-storage';

/**
 * 创建加密存储适配器
 * 自动对存储的数据进行加密，读取时自动解密
 * @param options 加密存储选项
 * @returns 加密存储适配器
 */
export function createEncryptedStorage(
  options: EncryptedStorageOptions | string
): StorageAdapter {
  // 兼容旧版本 API：如果第一个参数是字符串，则视为 encryptionKey
  const config: EncryptedStorageOptions =
    typeof options === 'string'
      ? { encryptionKey: options }
      : options;

  const {
    encryptionKey,
    storage,
    encryptionOptions = {},
  } = config;

  if (!encryptionKey) {
    throw new Error('加密密钥不能为空');
  }

  // 获取底层存储适配器
  const baseStorage = storage || createSecureStorage();

  // 创建加密存储适配器
  const encryptedStorage: StorageAdapter = {
    getItem(key: string): string | null {
      try {
        const encrypted = baseStorage.getItem(key);
        if (!encrypted) {
          return null;
        }

        // 解密数据
        const decrypted = aesDecrypt(encrypted, encryptionKey, encryptionOptions);
        return decrypted;
      } catch (error) {
        // 如果解密失败，可能是旧数据格式或损坏的数据
        console.warn(`解密存储项 "${key}" 失败:`, error);
        return null;
      }
    },

    setItem(key: string, value: string): void {
      try {
        // 加密数据
        const encrypted = aesEncrypt(value, encryptionKey, encryptionOptions);
        baseStorage.setItem(key, encrypted);
      } catch (error) {
        throw new Error(
          `加密存储项 "${key}" 失败: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    },

    removeItem(key: string): void {
      baseStorage.removeItem(key);
    },
  };

  // 可选方法
  if (baseStorage.clear) {
    encryptedStorage.clear = () => {
      baseStorage.clear?.();
    };
  }

  if (baseStorage.length !== undefined) {
    Object.defineProperty(encryptedStorage, 'length', {
      get(): number {
        return baseStorage.length || 0;
      },
      enumerable: true,
      configurable: true,
    });
  }

  if (baseStorage.key) {
    encryptedStorage.key = (index: number): string | null => {
      return baseStorage.key?.(index) || null;
    };
  }

  return encryptedStorage;
}
