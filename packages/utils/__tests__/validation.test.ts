import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateAddress,
  validatePaymentMethod,
  validatePostalCode,
} from '../src/validation';

describe('Validation Utils', () => {
  describe('validateEmail()', () => {
    it('should validate valid email addresses', () => {
      // Given & When & Then
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@example.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      // Given & When & Then
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    it('should support optional validation', () => {
      // Given & When & Then
      expect(validateEmail('', { required: false })).toBe(true);
      expect(validateEmail('', { required: true })).toBe(false);
    });

    it('should support custom regex pattern', () => {
      // Given
      const customPattern = /^test@/;

      // When & Then
      expect(validateEmail('test@example.com', { pattern: customPattern })).toBe(true);
      expect(validateEmail('other@example.com', { pattern: customPattern })).toBe(false);
    });
  });

  describe('validatePhone()', () => {
    it('should validate valid Chinese phone numbers', () => {
      // Given & When & Then
      expect(validatePhone('13800138000', 'CN')).toBe(true);
      expect(validatePhone('15912345678', 'CN')).toBe(true);
    });

    it('should reject invalid Chinese phone numbers', () => {
      // Given & When & Then
      expect(validatePhone('12345678901', 'CN')).toBe(false);
      expect(validatePhone('1380013800', 'CN')).toBe(false);
    });

    it('should validate valid US phone numbers', () => {
      // Given & When & Then
      expect(validatePhone('+12345678901', 'US')).toBe(true);
    });

    it('should handle empty string', () => {
      // Given & When & Then
      expect(validatePhone('', 'CN')).toBe(false);
    });
  });

  describe('validatePassword()', () => {
    it('should validate password that meets requirements', () => {
      // Given & When & Then
      expect(validatePassword('password123', { minLength: 6 })).toBe(true);
    });

    it('should check minimum length', () => {
      // Given & When & Then
      expect(validatePassword('short', { minLength: 6 })).toBe(false);
    });

    it('should check uppercase letter requirement', () => {
      // Given & When & Then
      expect(validatePassword('password123', { requireUppercase: true })).toBe(false);
      expect(validatePassword('Password123', { requireUppercase: true })).toBe(true);
    });

    it('should check lowercase letter requirement', () => {
      // Given & When & Then
      expect(validatePassword('PASSWORD123', { requireLowercase: true })).toBe(false);
      expect(validatePassword('Password123', { requireLowercase: true })).toBe(true);
    });

    it('should check number requirement', () => {
      // Given & When & Then
      expect(validatePassword('Password', { requireNumber: true })).toBe(false);
      expect(validatePassword('Password123', { requireNumber: true })).toBe(true);
    });

    it('should check special character requirement', () => {
      // Given & When & Then
      expect(validatePassword('Password123', { requireSpecialChar: true })).toBe(false);
      expect(validatePassword('Password123!', { requireSpecialChar: true })).toBe(true);
    });
  });

  describe('validateAddress()', () => {
    it('should validate valid address string', () => {
      // Given
      const address = '北京市朝阳区某某街道123号';

      // When
      const result = validateAddress(address);

      // Then
      expect(result.isValid).toBe(true);
    });

    it('should reject address that is too short', () => {
      // Given
      const address = '短';

      // When
      const result = validateAddress(address);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('地址长度至少为5个字符');
    });

    it('should validate complete address object', () => {
      // Given
      const address = {
        address: '北京市朝阳区某某街道123号',
        city: '北京',
        province: '北京市',
        postalCode: '100000',
      };

      // When
      const result = validateAddress(address);

      // Then
      expect(result.isValid).toBe(true);
    });

    it('should check required fields in address object', () => {
      // Given
      const address = {
        address: '',
        city: '北京',
        province: '北京市',
      };

      // When
      const result = validateAddress(address);

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('详细地址不能为空');
    });
  });

  describe('validatePaymentMethod()', () => {
    it('should validate valid payment methods', () => {
      // Given & When & Then
      expect(validatePaymentMethod('alipay')).toBe(true);
      expect(validatePaymentMethod('wechat')).toBe(true);
      expect(validatePaymentMethod('credit-card')).toBe(true);
    });

    it('should reject invalid payment methods', () => {
      // Given & When & Then
      expect(validatePaymentMethod('invalid')).toBe(false);
      expect(validatePaymentMethod('paypal')).toBe(false);
    });
  });

  describe('validatePostalCode()', () => {
    it('should validate valid Chinese postal codes', () => {
      // Given & When & Then
      expect(validatePostalCode('100000', 'CN')).toBe(true);
      expect(validatePostalCode('123456', 'CN')).toBe(true);
    });

    it('should reject invalid Chinese postal codes', () => {
      // Given & When & Then
      expect(validatePostalCode('12345', 'CN')).toBe(false);
      expect(validatePostalCode('1234567', 'CN')).toBe(false);
    });

    it('should validate valid US postal codes', () => {
      // Given & When & Then
      expect(validatePostalCode('12345', 'US')).toBe(true);
      expect(validatePostalCode('12345-6789', 'US')).toBe(true);
    });

    it('should handle empty string', () => {
      // Given & When & Then
      expect(validatePostalCode('', 'CN')).toBe(false);
    });
  });
});
