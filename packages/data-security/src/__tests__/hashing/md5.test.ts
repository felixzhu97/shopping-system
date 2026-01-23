import { describe, it, expect } from 'vitest';
import { md5 } from '../../hashing/md5';

describe('MD5', () => {
  describe('md5()', () => {
    it('should hash string to MD5', () => {
      expect(md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
      expect(md5('world')).toBe('7d793037a0760186574b0282f2f435e7');
    });

    it('should produce same hash for same input', () => {
      const hash1 = md5('test');
      const hash2 = md5('test');
      expect(hash1).toBe(hash2);
    });

    it('should handle empty string', () => {
      expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('should handle special characters', () => {
      const hash = md5('Hello, 世界!');
      expect(hash).toBeTruthy();
      expect(hash.length).toBe(32); // MD5 hash is 32 hex characters
    });
  });
});
