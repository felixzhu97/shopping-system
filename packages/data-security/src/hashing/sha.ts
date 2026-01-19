import CryptoJS from 'crypto-js';

/**
 * SHA1 哈希
 * @param data 要哈希的数据
 * @returns SHA1 哈希值（十六进制字符串）
 */
export function sha1(data: string): string {
  return CryptoJS.SHA1(data).toString();
}

/**
 * SHA256 哈希
 * @param data 要哈希的数据
 * @returns SHA256 哈希值（十六进制字符串）
 */
export function sha256(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * SHA512 哈希
 * @param data 要哈希的数据
 * @returns SHA512 哈希值（十六进制字符串）
 */
export function sha512(data: string): string {
  return CryptoJS.SHA512(data).toString();
}

/**
 * SHA3 哈希（256位）
 * @param data 要哈希的数据
 * @returns SHA3-256 哈希值（十六进制字符串）
 */
export function sha3(data: string): string {
  return CryptoJS.SHA3(data).toString();
}
