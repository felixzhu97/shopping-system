/**
 * PII 检测模式定义
 */

import { PIIType } from '../types';

/**
 * PII 检测模式接口
 */
export interface PIIPattern {
  /** PII 类型 */
  type: PIIType;
  /** 正则表达式模式 */
  pattern: RegExp;
  /** 置信度 */
  confidence: number;
  /** 验证函数（可选，用于更精确的验证） */
  validator?: (value: string) => boolean;
}

/**
 * 中国手机号验证
 */
function validateChinesePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  // 中国手机号以 1 开头，第二位为 3-9
  return /^1[3-9]\d{9}$/.test(digits);
}

/**
 * 邮箱验证
 */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 中国身份证号验证（18位）
 */
function validateChineseIdCard(idCard: string): boolean {
  const digits = idCard.replace(/\D/g, '');
  if (digits.length !== 18) return false;
  // 基本格式验证：前17位数字，最后一位可能是数字或X
  return /^\d{17}[\dXx]$/.test(idCard);
}

/**
 * 银行卡号验证（Luhn 算法）
 */
function validateBankCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  // Luhn 算法验证
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * IP 地址验证
 */
function validateIPAddress(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * PII 检测模式列表
 */
export const PII_PATTERNS: PIIPattern[] = [
  // 手机号
  {
    type: 'phone' as PIIType,
    pattern: /1[3-9]\d{9}/g,
    confidence: 0.9,
    validator: validateChinesePhone,
  },
  {
    type: 'phone' as PIIType,
    pattern: /\+\d{1,3}[\s-]?\d{1,4}[\s-]?\d{1,4}[\s-]?\d{1,9}/g,
    confidence: 0.8,
  },
  // 邮箱
  {
    type: 'email' as PIIType,
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    confidence: 0.95,
    validator: validateEmail,
  },
  // 身份证号
  {
    type: 'id_card' as PIIType,
    pattern: /\d{17}[\dXx]/g,
    confidence: 0.9,
    validator: validateChineseIdCard,
  },
  // 银行卡号
  {
    type: 'bank_card' as PIIType,
    pattern: /\d{13,19}/g,
    confidence: 0.85,
    validator: validateBankCard,
  },
  // 姓名（中文）
  {
    type: 'name' as PIIType,
    pattern: /[\u4e00-\u9fa5]{2,4}/g,
    confidence: 0.6,
  },
  // IP 地址
  {
    type: 'ip_address' as PIIType,
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    confidence: 0.8,
    validator: validateIPAddress,
  },
  // 日期/生日
  {
    type: 'date_of_birth' as PIIType,
    pattern: /\d{4}[-/]\d{1,2}[-/]\d{1,2}/g,
    confidence: 0.7,
  },
  // 护照号（中国）
  {
    type: 'passport' as PIIType,
    pattern: /[EG]\d{8}/g,
    confidence: 0.85,
  },
  // 驾驶证号
  {
    type: 'driver_license' as PIIType,
    pattern: /\d{12}/g,
    confidence: 0.75,
  },
  // 地址（简单匹配）
  {
    type: 'address' as PIIType,
    pattern: /[\u4e00-\u9fa5]{2,}(省|市|区|县|街道|路|号)/g,
    confidence: 0.65,
  },
];

/**
 * 根据类型获取 PII 模式
 */
export function getPatternsByType(type: PIIType): PIIPattern[] {
  return PII_PATTERNS.filter(pattern => pattern.type === type);
}

/**
 * 获取所有 PII 模式
 */
export function getAllPatterns(): PIIPattern[] {
  return PII_PATTERNS;
}
