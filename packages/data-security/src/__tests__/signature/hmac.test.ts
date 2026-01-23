import { describe, it, expect } from 'vitest';
import { hmacSign, hmacVerify } from '../../signature/hmac';

describe('HMAC', () => {
  const secretKey = 'my-secret-key';
  const testData = 'Hello, World!';

  describe('hmacSign()', () => {
    it('should sign data with SHA256', () => {
      const signature = hmacSign(testData, secretKey, 'sha256');
      expect(signature).toBeTruthy();
      expect(typeof signature).toBe('string');
    });

    it('should sign data with SHA1', () => {
      const signature = hmacSign(testData, secretKey, 'sha1');
      expect(signature).toBeTruthy();
    });

    it('should sign data with SHA512', () => {
      const signature = hmacSign(testData, secretKey, 'sha512');
      expect(signature).toBeTruthy();
    });

    it('should sign data with MD5', () => {
      const signature = hmacSign(testData, secretKey, 'md5');
      expect(signature).toBeTruthy();
    });

    it('should produce same signature for same input', () => {
      const sig1 = hmacSign(testData, secretKey);
      const sig2 = hmacSign(testData, secretKey);
      expect(sig1).toBe(sig2);
    });
  });

  describe('hmacVerify()', () => {
    it('should verify valid signature', () => {
      const signature = hmacSign(testData, secretKey);
      expect(hmacVerify(testData, signature, secretKey)).toBe(true);
    });

    it('should reject invalid signature', () => {
      const signature = hmacSign(testData, secretKey);
      expect(hmacVerify(testData, 'invalid-signature', secretKey)).toBe(false);
    });

    it('should reject signature with wrong key', () => {
      const signature = hmacSign(testData, secretKey);
      expect(hmacVerify(testData, signature, 'wrong-key')).toBe(false);
    });

    it('should verify signature with different algorithms', () => {
      const sha256Sig = hmacSign(testData, secretKey, 'sha256');
      expect(hmacVerify(testData, sha256Sig, secretKey, 'sha256')).toBe(true);

      const sha512Sig = hmacSign(testData, secretKey, 'sha512');
      expect(hmacVerify(testData, sha512Sig, secretKey, 'sha512')).toBe(true);
    });
  });
});
