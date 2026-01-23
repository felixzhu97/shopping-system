import CryptoJS from 'crypto-js';

/**
 * MD5 哈希
 * @param data 要哈希的数据
 * @returns MD5 哈希值（十六进制字符串）
 */
export function md5(data: string): string {
  return CryptoJS.MD5(data).toString();
}
