import { describe, it, expect } from 'vitest';
import { maskPhone } from '../../masking/phone';

describe('Phone Masking', () => {
  describe('maskPhone()', () => {
    it('should mask Chinese phone number', () => {
      expect(maskPhone('13812345678')).toBe('138****5678');
      expect(maskPhone('15987654321')).toBe('159****4321');
    });

    it('should handle phone with spaces', () => {
      expect(maskPhone('138 1234 5678')).toBe('138****5678');
      expect(maskPhone('159-8765-4321')).toBe('159****4321');
    });

    it('should handle short phone numbers', () => {
      expect(maskPhone('1234567')).toBeTruthy();
      expect(maskPhone('12345')).toBeTruthy();
    });

    it('should handle empty string', () => {
      expect(maskPhone('')).toBe('');
    });

    it('should handle custom mask character', () => {
      expect(maskPhone('13812345678', '#')).toBe('138####5678');
    });

    it('should handle very short phone numbers', () => {
      expect(maskPhone('12')).toBe('12');
      // 对于长度为3的数字，保留第一位和最后一位，中间用*替换
      expect(maskPhone('123')).toBe('1*3');
    });
  });
});
