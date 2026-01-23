import type { OAuthToken } from '../types';
import { storage } from '../utils/storage';

const TOKEN_STORAGE_KEY = 'oauth_token';
const TOKEN_EXPIRY_KEY = 'oauth_token_expiry';

/**
 * Token 管理器
 * 负责 Token 的存储、获取和刷新
 */
export class TokenManager {
  /**
   * 保存 Token
   */
  async saveToken(token: OAuthToken, provider?: string): Promise<void> {
    const key = provider ? `${TOKEN_STORAGE_KEY}_${provider}` : TOKEN_STORAGE_KEY;
    await storage.setJSON(key, token);

    // 保存过期时间
    if (token.expiresIn) {
      const expiryTime = Date.now() + token.expiresIn * 1000;
      const expiryKey = provider
        ? `${TOKEN_EXPIRY_KEY}_${provider}`
        : TOKEN_EXPIRY_KEY;
      await storage.setItem(expiryKey, expiryTime.toString());
    }
  }

  /**
   * 获取 Token
   */
  async getToken(provider?: string): Promise<OAuthToken | null> {
    const key = provider ? `${TOKEN_STORAGE_KEY}_${provider}` : TOKEN_STORAGE_KEY;
    return storage.getJSON<OAuthToken>(key);
  }

  /**
   * 删除 Token
   */
  async removeToken(provider?: string): Promise<void> {
    const key = provider ? `${TOKEN_STORAGE_KEY}_${provider}` : TOKEN_STORAGE_KEY;
    await storage.removeItem(key);

    const expiryKey = provider
      ? `${TOKEN_EXPIRY_KEY}_${provider}`
      : TOKEN_EXPIRY_KEY;
    await storage.removeItem(expiryKey);
  }

  /**
   * 检查 Token 是否过期
   */
  async isTokenExpired(provider?: string): Promise<boolean> {
    const expiryKey = provider
      ? `${TOKEN_EXPIRY_KEY}_${provider}`
      : TOKEN_EXPIRY_KEY;
    const expiryTimeStr = await storage.getItem(expiryKey);

    if (!expiryTimeStr) {
      return true; // 没有过期时间，认为已过期
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    return Date.now() >= expiryTime;
  }

  /**
   * 获取 Token 剩余有效时间（秒）
   */
  async getTokenRemainingTime(provider?: string): Promise<number> {
    const expiryKey = provider
      ? `${TOKEN_EXPIRY_KEY}_${provider}`
      : TOKEN_EXPIRY_KEY;
    const expiryTimeStr = await storage.getItem(expiryKey);

    if (!expiryTimeStr) {
      return 0;
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    const remaining = Math.floor((expiryTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  }
}

// 导出单例实例
export const tokenManager = new TokenManager();
