/**
 * Tokenization：将敏感数据替换为不可逆的 token
 */

import CryptoJS from 'crypto-js';
import type { TokenizationOptions } from '../types';

/**
 * 生成 UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成数字 token
 */
function generateNumericToken(length: number): string {
  const digits = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * 10));
  }
  return result;
}

/**
 * Tokenize 单个值
 * @param value 要 tokenize 的值
 * @param options Tokenization 选项
 * @returns Token
 */
export function tokenize(
  value: string,
  options: TokenizationOptions = {}
): string {
  const {
    reversible = false,
    encryptionKey,
    format = 'hash',
    length = 16,
  } = options;

  // 可逆 tokenization（使用加密）
  if (reversible) {
    if (!encryptionKey) {
      throw new Error('可逆 tokenization 需要提供 encryptionKey');
    }
    // 使用 AES 加密生成 token
    const encrypted = CryptoJS.AES.encrypt(value, encryptionKey).toString();
    // 返回 Base64 编码的加密结果
    return encrypted;
  }

  // 不可逆 tokenization
  switch (format) {
    case 'uuid':
      // 使用哈希值生成确定性 UUID
      const hash = CryptoJS.SHA256(value).toString();
      // 将哈希转换为 UUID 格式
      return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-${hash.substring(16, 20)}-${hash.substring(20, 32)}`;
    
    case 'numeric':
      // 使用哈希值生成确定性数字 token
      const numericHash = CryptoJS.SHA256(value).toString();
      // 将哈希转换为数字
      let numericToken = '';
      for (let i = 0; i < length && i < numericHash.length; i++) {
        const char = numericHash[i];
        if (char >= '0' && char <= '9') {
          numericToken += char;
        } else {
          // 将十六进制字符转换为数字
          numericToken += (parseInt(char, 16) % 10).toString();
        }
      }
      // 如果长度不足，用随机数字填充
      while (numericToken.length < length) {
        numericToken += generateNumericToken(1);
      }
      return numericToken.substring(0, length);
    
    case 'hash':
    default:
      // 使用 SHA256 哈希
      return CryptoJS.SHA256(value).toString();
  }
}

/**
 * 从 token 还原值（仅当 reversible 为 true 时）
 * @param token Token
 * @param encryptionKey 加密密钥
 * @returns 原始值
 */
export function detokenize(
  token: string,
  encryptionKey: string
): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(token, encryptionKey);
    const value = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!value) {
      throw new Error('无法还原 token：解密失败');
    }
    
    return value;
  } catch (error) {
    throw new Error(`Token 还原失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Tokenize 对象中的字段
 * @param obj 要 tokenize 的对象
 * @param fields 要 tokenize 的字段列表
 * @param options Tokenization 选项
 * @returns Tokenize 后的对象
 */
export function tokenizeFields(
  obj: Record<string, unknown>,
  fields: string[],
  options: TokenizationOptions = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...obj };

  for (const field of fields) {
    if (field in result) {
      const value = result[field];
      if (typeof value === 'string') {
        result[field] = tokenize(value, options);
      }
    }
  }

  return result;
}

/**
 * 批量 tokenize 对象数组
 * @param data 对象数组
 * @param fields 要 tokenize 的字段列表
 * @param options Tokenization 选项
 * @returns Tokenize 后的对象数组
 */
export function tokenizeFieldsInArray(
  data: Record<string, unknown>[],
  fields: string[],
  options: TokenizationOptions = {}
): Record<string, unknown>[] {
  return data.map(obj => tokenizeFields(obj, fields, options));
}
