/**
 * 假名化：将标识符替换为假名
 */

import CryptoJS from 'crypto-js';
import type { PseudonymizationOptions } from '../types';

/**
 * 生成假名
 * @param value 要假名化的值
 * @param options 假名化选项
 * @returns 假名
 */
export function pseudonymize(
  value: string,
  options: PseudonymizationOptions = {}
): string {
  const {
    reversible = false,
    encryptionKey,
    prefix = '',
    suffix = '',
  } = options;

  // 可逆假名化（使用加密）
  if (reversible) {
    if (!encryptionKey) {
      throw new Error('可逆假名化需要提供 encryptionKey');
    }
    // 使用 AES 加密
    const encrypted = CryptoJS.AES.encrypt(value, encryptionKey).toString();
    // 将加密结果转换为更友好的格式
    const base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encrypted));
    // 移除特殊字符，只保留字母数字
    const clean = base64.replace(/[^a-zA-Z0-9]/g, '');
    return `${prefix}${clean}${suffix}`;
  }

  // 不可逆假名化（使用哈希）
  const hash = CryptoJS.SHA256(value).toString();
  // 取前16个字符作为假名
  const pseudonym = hash.substring(0, 16);
  return `${prefix}${pseudonym}${suffix}`;
}

/**
 * 从假名还原值（仅当 reversible 为 true 时）
 * @param pseudonym 假名
 * @param encryptionKey 加密密钥
 * @param prefix 假名前缀
 * @param suffix 假名后缀
 * @returns 原始值
 */
export function depseudonymize(
  pseudonym: string,
  encryptionKey: string,
  prefix = '',
  suffix = ''
): string {
  try {
    // 移除前缀和后缀
    let clean = pseudonym;
    if (prefix && clean.startsWith(prefix)) {
      clean = clean.substring(prefix.length);
    }
    if (suffix && clean.endsWith(suffix)) {
      clean = clean.substring(0, clean.length - suffix.length);
    }

    // 尝试还原 Base64 编码
    // 注意：这里简化处理，实际可能需要更复杂的逻辑
    const base64 = clean;
    const encrypted = CryptoJS.enc.Base64.parse(base64).toString(CryptoJS.enc.Utf8);
    
    const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey);
    const value = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!value) {
      throw new Error('无法还原假名：解密失败');
    }
    
    return value;
  } catch (error) {
    // 如果上述方法失败，尝试直接解密
    try {
      const decrypted = CryptoJS.AES.decrypt(clean, encryptionKey);
      const value = decrypted.toString(CryptoJS.enc.Utf8);
      if (value) {
        return value;
      }
    } catch {
      // 忽略错误
    }
    
    throw new Error(`假名还原失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 假名化对象中的字段
 * @param obj 要假名化的对象
 * @param fields 要假名化的字段列表
 * @param options 假名化选项
 * @returns 假名化后的对象
 */
export function pseudonymizeFields(
  obj: Record<string, unknown>,
  fields: string[],
  options: PseudonymizationOptions = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...obj };

  for (const field of fields) {
    if (field in result) {
      const value = result[field];
      if (typeof value === 'string') {
        result[field] = pseudonymize(value, options);
      }
    }
  }

  return result;
}

/**
 * 批量假名化对象数组
 * @param data 对象数组
 * @param fields 要假名化的字段列表
 * @param options 假名化选项
 * @returns 假名化后的对象数组
 */
export function pseudonymizeFieldsInArray(
  data: Record<string, unknown>[],
  fields: string[],
  options: PseudonymizationOptions = {}
): Record<string, unknown>[] {
  return data.map(obj => pseudonymizeFields(obj, fields, options));
}

/**
 * 创建假名映射（用于可逆假名化）
 * @param value 原始值
 * @param options 假名化选项
 * @returns 假名和原始值的映射
 */
export function createPseudonymMapping(
  value: string,
  options: PseudonymizationOptions = {}
): { pseudonym: string; original: string } {
  const pseudonym = pseudonymize(value, options);
  return {
    pseudonym,
    original: value,
  };
}
