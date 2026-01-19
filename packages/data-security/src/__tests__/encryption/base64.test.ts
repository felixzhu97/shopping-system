import { describe, it, expect } from 'vitest';
import { base64Encode, base64Decode } from '../../encryption/base64';

describe('Base64', () => {
  describe('base64Encode()', () => {
    it('should encode string to base64', () => {
      expect(base64Encode('Hello World')).toBe('SGVsbG8gV29ybGQ=');
      expect(base64Encode('test')).toBe('dGVzdA==');
      expect(base64Encode('')).toBe('');
    });

    it('should handle special characters', () => {
      expect(base64Encode('Hello, 世界!')).toBe('SGVsbG8sIOS4lueVjCE=');
    });
  });

  describe('base64Decode()', () => {
    it('should decode base64 to string', () => {
      expect(base64Decode('SGVsbG8gV29ybGQ=')).toBe('Hello World');
      expect(base64Decode('dGVzdA==')).toBe('test');
      expect(base64Decode('')).toBe('');
    });

    it('should handle special characters', () => {
      expect(base64Decode('SGVsbG8sIOS4lueVjCE=')).toBe('Hello, 世界!');
    });

    it('should throw error for invalid base64', () => {
      expect(() => base64Decode('invalid!@#')).toThrow();
    });
  });

  describe('base64Encode and base64Decode', () => {
    it('should be reversible', () => {
      const original = 'Hello, World! 测试数据 123';
      const encoded = base64Encode(original);
      const decoded = base64Decode(encoded);
      expect(decoded).toBe(original);
    });
  });
});
