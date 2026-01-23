import { describe, it, expect } from 'vitest';
import { maskEmail } from '../../masking/email';

describe('Email Masking', () => {
  describe('maskEmail()', () => {
    it('should mask email address', () => {
      const masked = maskEmail('example@domain.com');
      expect(masked).toContain('@');
      expect(masked).toContain('domain.com');
      expect(masked).toMatch(/^[\w*]+@domain\.com$/);
    });

    it('should handle short local part', () => {
      expect(maskEmail('ab@example.com')).toBeTruthy();
      expect(maskEmail('a@example.com')).toBeTruthy();
    });

    it('should preserve domain part', () => {
      const masked = maskEmail('test@example.com');
      expect(masked.endsWith('@example.com')).toBe(true);
    });

    it('should handle empty string', () => {
      expect(maskEmail('')).toBe('');
    });

    it('should handle invalid email format', () => {
      expect(maskEmail('not-an-email')).toBe('not-an-email');
      expect(maskEmail('test@')).toBe('test@');
    });

    it('should handle custom mask character', () => {
      const masked = maskEmail('example@domain.com', '#');
      expect(masked).toContain('#');
    });
  });
});
