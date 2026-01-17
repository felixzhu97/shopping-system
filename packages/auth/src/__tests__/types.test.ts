import { describe, it, expect } from 'vitest';
import { OAuthProvider, OAuthError } from '../types';

describe('OAuthProvider', () => {
  describe('enum values', () => {
    it('should have all expected provider values', () => {
      // Then
      expect(OAuthProvider.GOOGLE).toBe('google');
      expect(OAuthProvider.FACEBOOK).toBe('facebook');
      expect(OAuthProvider.GITHUB).toBe('github');
      expect(OAuthProvider.APPLE).toBe('apple');
      expect(OAuthProvider.WECHAT).toBe('wechat');
      expect(OAuthProvider.ALIPAY).toBe('alipay');
    });
  });
});

describe('OAuthError', () => {
  describe('constructor', () => {
    it('should create error with message', () => {
      // Given
      const message = 'Test error';

      // When
      const error = new OAuthError(message);

      // Then
      expect(error.message).toBe(message);
      expect(error.name).toBe('OAuthError');
      expect(error.code).toBeUndefined();
      expect(error.statusCode).toBeUndefined();
    });

    it('should create error with message and code', () => {
      // Given
      const message = 'Test error';
      const code = 'INVALID_TOKEN';

      // When
      const error = new OAuthError(message, code);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.statusCode).toBeUndefined();
    });

    it('should create error with message, code and statusCode', () => {
      // Given
      const message = 'Test error';
      const code = 'INVALID_TOKEN';
      const statusCode = 401;

      // When
      const error = new OAuthError(message, code, statusCode);

      // Then
      expect(error.message).toBe(message);
      expect(error.code).toBe(code);
      expect(error.statusCode).toBe(statusCode);
    });
  });
});
