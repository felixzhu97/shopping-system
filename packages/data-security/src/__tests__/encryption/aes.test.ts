import { describe, it, expect } from 'vitest';
import { aesEncrypt, aesDecrypt } from '../../encryption/aes';

describe('AES', () => {
  const secretKey = 'my-secret-key-12345';
  const testData = 'Hello, World! 测试数据';

  describe('aesEncrypt()', () => {
    it('should encrypt data', () => {
      const encrypted = aesEncrypt(testData, secretKey);
      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(testData);
      expect(typeof encrypted).toBe('string');
    });

    it('should produce different output for same input (due to IV)', () => {
      const encrypted1 = aesEncrypt(testData, secretKey);
      const encrypted2 = aesEncrypt(testData, secretKey);
      // 由于随机 IV，每次加密结果应该不同
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('aesDecrypt()', () => {
    it('should decrypt encrypted data', () => {
      const encrypted = aesEncrypt(testData, secretKey);
      const decrypted = aesDecrypt(encrypted, secretKey);
      expect(decrypted).toBe(testData);
    });

    it('should throw error for wrong key', () => {
      const encrypted = aesEncrypt(testData, secretKey);
      expect(() => aesDecrypt(encrypted, 'wrong-key')).toThrow();
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => aesDecrypt('invalid-data', secretKey)).toThrow();
    });
  });

  describe('aesEncrypt and aesDecrypt', () => {
    it('should be reversible with correct key', () => {
      const original = 'Test data 测试';
      const encrypted = aesEncrypt(original, secretKey);
      const decrypted = aesDecrypt(encrypted, secretKey);
      expect(decrypted).toBe(original);
    });

    it('should handle empty string', () => {
      const encrypted = aesEncrypt('', secretKey);
      const decrypted = aesDecrypt(encrypted, secretKey);
      expect(decrypted).toBe('');
    });

    it('should handle long string', () => {
      const longString = 'a'.repeat(1000);
      const encrypted = aesEncrypt(longString, secretKey);
      const decrypted = aesDecrypt(encrypted, secretKey);
      expect(decrypted).toBe(longString);
    });
  });
});
