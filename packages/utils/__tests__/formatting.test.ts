import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatNumber, formatPhoneNumber } from '../src/formatting';

describe('Formatting Utils', () => {
  describe('formatCurrency()', () => {
    it('should format CNY currency correctly', () => {
      // Given
      const amount = 100;
      const currency = 'CNY';
      const locale = 'zh-CN';

      // When
      const result = formatCurrency(amount, currency, locale);

      // Then
      expect(result).toContain('100');
      // In Chinese locale, CNY is displayed as ¥ symbol, not "CNY" text
      expect(result).toMatch(/¥|CNY|元/);
    });

    it('should handle decimal amounts', () => {
      // Given
      const amount = 99.99;

      // When
      const result = formatCurrency(amount, 'CNY', 'zh-CN');

      // Then
      expect(result).toContain('99.99');
    });

    it('should use default parameters', () => {
      // Given
      const amount = 100;

      // When
      const result = formatCurrency(amount);

      // Then
      expect(result).toBeTruthy();
    });
  });

  describe('formatDate()', () => {
    const testDate = new Date('2024-01-15T10:30:00');

    it('should format date with short format', () => {
      // Given
      const date = testDate;
      const format = 'short';

      // When
      const result = formatDate(date, format);

      // Then
      expect(result).toBeTruthy();
    });

    it('should format date with long format', () => {
      // Given
      const date = testDate;
      const format = 'long';

      // When
      const result = formatDate(date, format);

      // Then
      expect(result).toBeTruthy();
    });

    it('should format date with custom format', () => {
      // Given
      const date = testDate;
      const format = 'YYYY-MM-DD';

      // When
      const result = formatDate(date, format);

      // Then
      expect(result).toBe('2024-01-15');
    });

    it('should handle timestamp', () => {
      // Given
      const timestamp = testDate.getTime();
      const format = 'YYYY-MM-DD';

      // When
      const result = formatDate(timestamp, format);

      // Then
      expect(result).toBe('2024-01-15');
    });

    it('should handle date string', () => {
      // Given
      const dateString = '2024-01-15';
      const format = 'YYYY-MM-DD';

      // When
      const result = formatDate(dateString, format);

      // Then
      expect(result).toBe('2024-01-15');
    });

    it('should handle invalid date', () => {
      // Given
      const invalidDate = 'invalid';

      // When
      const result = formatDate(invalidDate);

      // Then
      expect(result).toBe('Invalid Date');
    });
  });

  describe('formatNumber()', () => {
    it('should format number correctly', () => {
      // Given
      const number = 1234.56;

      // When
      const result = formatNumber(number);

      // Then
      expect(result).toBeTruthy();
    });

    it('should support custom decimal places', () => {
      // Given
      const number = 1234.567;
      const options = { decimals: 1, useGrouping: false };

      // When
      const result = formatNumber(number, options);

      // Then
      expect(result).toContain('1234.6');
    });

    it('should support disabling thousand separator', () => {
      // Given
      const number = 1234.56;
      const options = { useGrouping: false };

      // When
      const result = formatNumber(number, options);

      // Then
      expect(result).not.toContain(',');
    });

    it('should use default options', () => {
      // Given
      const number = 1234.56;

      // When
      const result = formatNumber(number);

      // Then
      expect(result).toBeTruthy();
    });
  });

  describe('formatPhoneNumber()', () => {
    it('should format Chinese phone number correctly', () => {
      // Given
      const phone = '13800138000';
      const country = 'CN';

      // When
      const result = formatPhoneNumber(phone, country);

      // Then
      expect(result).toBe('138 0013 8000');
    });

    it('should format US phone number correctly', () => {
      // Given
      const phone = '1234567890';
      const country = 'US';

      // When
      const result = formatPhoneNumber(phone, country);

      // Then
      expect(result).toBe('(123) 456-7890');
    });

    it('should handle invalid phone number', () => {
      // Given
      const phone = '123';
      const country = 'CN';

      // When
      const result = formatPhoneNumber(phone, country);

      // Then
      expect(result).toBe('123');
    });

    it('should handle empty string', () => {
      // Given
      const phone = '';
      const country = 'CN';

      // When
      const result = formatPhoneNumber(phone, country);

      // Then
      expect(result).toBe('');
    });

    it('should remove non-numeric characters', () => {
      // Given
      const phone = '138-0013-8000';
      const country = 'CN';

      // When
      const result = formatPhoneNumber(phone, country);

      // Then
      expect(result).toBe('138 0013 8000');
    });
  });
});
