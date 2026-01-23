import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenManager } from '../../core/token-manager';
import type { OAuthToken } from '../../types';
import { storage } from '../../utils/storage';

// Mock storage
vi.mock('../../utils/storage', () => ({
  storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    getJSON: vi.fn(),
    setJSON: vi.fn(),
  },
}));

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  let mockToken: OAuthToken;

  beforeEach(() => {
    // Given
    tokenManager = new TokenManager();
    mockToken = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 3600,
    };
    vi.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token without provider', async () => {
      // When
      await tokenManager.saveToken(mockToken);

      // Then
      expect(storage.setJSON).toHaveBeenCalledWith('oauth_token', mockToken);
    });

    it('should save token with provider', async () => {
      // Given
      const provider = 'google';

      // When
      await tokenManager.saveToken(mockToken, provider);

      // Then
      expect(storage.setJSON).toHaveBeenCalledWith('oauth_token_google', mockToken);
    });

    it('should save expiry time when expiresIn is provided', async () => {
      // Given
      const beforeTime = Date.now();

      // When
      await tokenManager.saveToken(mockToken);

      // Then
      expect(storage.setItem).toHaveBeenCalled();
      const setItemCalls = (storage.setItem as any).mock.calls;
      const expiryCall = setItemCalls.find((call: any[]) => call[0] === 'oauth_token_expiry');
      expect(expiryCall).toBeDefined();
      const expiryTime = parseInt(expiryCall[1], 10);
      expect(expiryTime).toBeGreaterThan(beforeTime);
      // 允许 1 秒的误差
      expect(expiryTime).toBeLessThanOrEqual(beforeTime + 3600 * 1000 + 1000);
    });
  });

  describe('getToken', () => {
    it('should get token without provider', async () => {
      // Given
      (storage.getJSON as any).mockResolvedValue(mockToken);

      // When
      const token = await tokenManager.getToken();

      // Then
      expect(token).toEqual(mockToken);
      expect(storage.getJSON).toHaveBeenCalledWith('oauth_token');
    });

    it('should get token with provider', async () => {
      // Given
      const provider = 'google';
      (storage.getJSON as any).mockResolvedValue(mockToken);

      // When
      const token = await tokenManager.getToken(provider);

      // Then
      expect(token).toEqual(mockToken);
      expect(storage.getJSON).toHaveBeenCalledWith('oauth_token_google');
    });

    it('should return null when token not found', async () => {
      // Given
      (storage.getJSON as any).mockResolvedValue(null);

      // When
      const token = await tokenManager.getToken();

      // Then
      expect(token).toBeNull();
    });
  });

  describe('removeToken', () => {
    it('should remove token without provider', async () => {
      // When
      await tokenManager.removeToken();

      // Then
      expect(storage.removeItem).toHaveBeenCalledWith('oauth_token');
      expect(storage.removeItem).toHaveBeenCalledWith('oauth_token_expiry');
    });

    it('should remove token with provider', async () => {
      // Given
      const provider = 'google';

      // When
      await tokenManager.removeToken(provider);

      // Then
      expect(storage.removeItem).toHaveBeenCalledWith('oauth_token_google');
      expect(storage.removeItem).toHaveBeenCalledWith('oauth_token_expiry_google');
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no expiry time', async () => {
      // Given
      (storage.getItem as any).mockResolvedValue(null);

      // When
      const isExpired = await tokenManager.isTokenExpired();

      // Then
      expect(isExpired).toBe(true);
    });

    it('should return false when token not expired', async () => {
      // Given
      const futureTime = Date.now() + 3600 * 1000;
      (storage.getItem as any).mockResolvedValue(futureTime.toString());

      // When
      const isExpired = await tokenManager.isTokenExpired();

      // Then
      expect(isExpired).toBe(false);
    });

    it('should return true when token expired', async () => {
      // Given
      const pastTime = Date.now() - 1000;
      (storage.getItem as any).mockResolvedValue(pastTime.toString());

      // When
      const isExpired = await tokenManager.isTokenExpired();

      // Then
      expect(isExpired).toBe(true);
    });
  });

  describe('getTokenRemainingTime', () => {
    it('should return remaining time in seconds', async () => {
      // Given
      const futureTime = Date.now() + 3600 * 1000;
      (storage.getItem as any).mockResolvedValue(futureTime.toString());

      // When
      const remaining = await tokenManager.getTokenRemainingTime();

      // Then
      expect(remaining).toBeGreaterThan(3500);
      expect(remaining).toBeLessThanOrEqual(3600);
    });

    it('should return 0 when no expiry time', async () => {
      // Given
      (storage.getItem as any).mockResolvedValue(null);

      // When
      const remaining = await tokenManager.getTokenRemainingTime();

      // Then
      expect(remaining).toBe(0);
    });

    it('should return 0 when token expired', async () => {
      // Given
      const pastTime = Date.now() - 1000;
      (storage.getItem as any).mockResolvedValue(pastTime.toString());

      // When
      const remaining = await tokenManager.getTokenRemainingTime();

      // Then
      expect(remaining).toBe(0);
    });
  });
});
