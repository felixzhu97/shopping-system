import { describe, it, expect } from 'vitest';
import { maskIdCard } from '../../masking/id-card';

describe('ID Card Masking', () => {
  describe('maskIdCard()', () => {
    it('should mask 18-digit Chinese ID card', () => {
      const masked = maskIdCard('110101199001011234');
      expect(masked).toBe('110***********1234');
      expect(masked.length).toBe(18);
    });

    it('should mask 15-digit Chinese ID card', () => {
      const masked = maskIdCard('110101900101234');
      expect(masked.length).toBe(15);
      expect(masked.startsWith('110')).toBe(true);
    });

    it('should handle ID card with spaces', () => {
      const masked = maskIdCard('110 1011 9900 101 234');
      expect(masked.replace(/[^0-9X*]/g, '')).toBeTruthy();
    });

    it('should handle empty string', () => {
      expect(maskIdCard('')).toBe('');
    });

    it('should handle short ID numbers', () => {
      expect(maskIdCard('123')).toBeTruthy();
    });

    it('should handle custom mask character', () => {
      const masked = maskIdCard('110101199001011234', '#');
      expect(masked).toContain('#');
    });
  });
});
