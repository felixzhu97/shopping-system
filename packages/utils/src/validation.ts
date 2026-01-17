import type { PaymentMethod } from 'shared';
import type {
  AddressValidationResult,
  PasswordValidationOptions,
  ValidationOptions,
} from './types';

/**
 * 邮箱验证正则表达式
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * 中国手机号验证正则表达式
 */
const CHINA_PHONE_REGEX = /^1[3-9]\d{9}$/;

/**
 * 美国手机号验证正则表达式
 */
const US_PHONE_REGEX = /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/;

/**
 * 验证邮箱
 * @param email 邮箱地址
 * @param options 验证选项
 * @returns 是否有效
 */
export function validateEmail(email: string, options: ValidationOptions = {}): boolean {
  const { required = true } = options;

  if (!email) {
    return !required;
  }

  if (options.pattern) {
    return options.pattern.test(email);
  }

  if (options.minLength && email.length < options.minLength) {
    return false;
  }

  if (options.maxLength && email.length > options.maxLength) {
    return false;
  }

  return EMAIL_REGEX.test(email);
}

/**
 * 验证手机号
 * @param phone 手机号
 * @param country 国家代码（'CN' 中国，'US' 美国，默认 'CN'）
 * @returns 是否有效
 */
export function validatePhone(phone: string, country: 'CN' | 'US' = 'CN'): boolean {
  if (!phone) {
    return false;
  }

  // 移除空格和特殊字符
  const cleaned = phone.replace(/[\s-()]/g, '');

  if (country === 'CN') {
    return CHINA_PHONE_REGEX.test(cleaned);
  }

  if (country === 'US') {
    return US_PHONE_REGEX.test(cleaned);
  }

  // 默认：至少10位数字
  return /^\d{10,}$/.test(cleaned);
}

/**
 * 验证密码强度
 * @param password 密码
 * @param options 验证选项
 * @returns 是否有效
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = {}
): boolean {
  const {
    required = true,
    minLength = 6,
    maxLength,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  if (!password) {
    return !required;
  }

  if (password.length < minLength) {
    return false;
  }

  if (maxLength && password.length > maxLength) {
    return false;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return false;
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return false;
  }

  if (requireNumber && !/\d/.test(password)) {
    return false;
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
}

/**
 * 验证地址
 * @param address 地址对象或地址字符串
 * @returns 验证结果
 */
export function validateAddress(
  address: string | { address?: string; city?: string; province?: string; postalCode?: string }
): AddressValidationResult {
  const errors: string[] = [];

  if (typeof address === 'string') {
    if (!address.trim()) {
      errors.push('地址不能为空');
    } else if (address.trim().length < 5) {
      errors.push('地址长度至少为5个字符');
    }
  } else {
    if (!address.address || !address.address.trim()) {
      errors.push('详细地址不能为空');
    } else if (address.address.trim().length < 5) {
      errors.push('详细地址长度至少为5个字符');
    }

    if (!address.city || !address.city.trim()) {
      errors.push('城市不能为空');
    }

    if (!address.province || !address.province.trim()) {
      errors.push('省份不能为空');
    }

    if (address.postalCode && !validatePostalCode(address.postalCode)) {
      errors.push('邮编格式不正确');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * 验证支付方式
 * @param method 支付方式
 * @returns 是否有效
 */
export function validatePaymentMethod(method: string): method is PaymentMethod {
  const validMethods: PaymentMethod[] = ['alipay', 'wechat', 'credit-card'];
  return validMethods.includes(method as PaymentMethod);
}

/**
 * 验证邮编
 * @param code 邮编
 * @param country 国家代码（'CN' 中国，'US' 美国，默认 'CN'）
 * @returns 是否有效
 */
export function validatePostalCode(code: string, country: 'CN' | 'US' = 'CN'): boolean {
  if (!code) {
    return false;
  }

  if (country === 'CN') {
    // 中国邮编：6位数字
    return /^\d{6}$/.test(code);
  }

  if (country === 'US') {
    // 美国邮编：5位数字或5+4格式
    return /^\d{5}(-\d{4})?$/.test(code);
  }

  // 默认：至少4位数字
  return /^\d{4,}$/.test(code);
}