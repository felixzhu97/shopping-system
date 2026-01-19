import { describe, it, expect } from 'vitest';
import { sha1, sha256, sha512, sha3 } from '../../hashing/sha';

describe('SHA', () => {
  const testData = 'Hello, World!';

  describe('sha1()', () => {
    it('should hash string to SHA1', () => {
      const hash = sha1(testData);
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(40); // SHA1 hash is 40 hex characters
    });

    it('should produce same hash for same input', () => {
      const hash1 = sha1(testData);
      const hash2 = sha1(testData);
      expect(hash1).toBe(hash2);
    });
  });

  describe('sha256()', () => {
    it('should hash string to SHA256', () => {
      const hash = sha256(testData);
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(64); // SHA256 hash is 64 hex characters
    });

    it('should produce same hash for same input', () => {
      const hash1 = sha256(testData);
      const hash2 = sha256(testData);
      expect(hash1).toBe(hash2);
    });
  });

  describe('sha512()', () => {
    it('should hash string to SHA512', () => {
      const hash = sha512(testData);
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(128); // SHA512 hash is 128 hex characters
    });

    it('should produce same hash for same input', () => {
      const hash1 = sha512(testData);
      const hash2 = sha512(testData);
      expect(hash1).toBe(hash2);
    });
  });

  describe('sha3()', () => {
    it('should hash string to SHA3', () => {
      const hash = sha3(testData);
      expect(hash).toBeTruthy();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce same hash for same input', () => {
      const hash1 = sha3(testData);
      const hash2 = sha3(testData);
      expect(hash1).toBe(hash2);
    });
  });

  describe('hash consistency', () => {
    it('should produce different hashes for different algorithms', () => {
      const sha1Hash = sha1(testData);
      const sha256Hash = sha256(testData);
      const sha512Hash = sha512(testData);

      expect(sha1Hash).not.toBe(sha256Hash);
      expect(sha256Hash).not.toBe(sha512Hash);
      expect(sha1Hash).not.toBe(sha512Hash);
    });
  });
});
