import { describe, it, expect } from 'vitest';
import { maskBankCard } from '../../masking/bank-card';

describe('Bank Card Masking', () => {
  describe('maskBankCard()', () => {
    it('should mask bank card number', () => {
      const masked = maskBankCard('6222021234567890');
      expect(masked).toContain('6222');
      expect(masked).toContain('7890');
      expect(masked).toContain('*');
    });

    it('should handle card with spaces', () => {
      const masked = maskBankCard('6222 0212 3456 7890');
      expect(masked).toBeTruthy();
    });

    it('should handle short card numbers', () => {
      expect(maskBankCard('123456')).toBeTruthy();
      expect(maskBankCard('1234')).toBeTruthy();
    });

    it('should handle empty string', () => {
      expect(maskBankCard('')).toBe('');
    });

    it('should handle custom mask character', () => {
      const masked = maskBankCard('6222021234567890', '#');
      expect(masked).toContain('#');
    });
  });
});
