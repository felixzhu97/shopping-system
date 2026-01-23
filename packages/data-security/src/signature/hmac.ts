import CryptoJS from 'crypto-js';
import type { HMACAlgorithm } from '../types';

/**
 * HMAC 算法映射
 */
const ALGORITHM_MAP: Record<HMACAlgorithm, typeof CryptoJS.algo.HMAC> = {
  sha1: CryptoJS.algo.HMAC,
  sha256: CryptoJS.algo.HMAC,
  sha512: CryptoJS.algo.HMAC,
  md5: CryptoJS.algo.HMAC,
};

/**
 * HMAC 哈希函数映射
 */
const HASH_FUNCTION_MAP: Record<HMACAlgorithm, typeof CryptoJS.SHA256> = {
  sha1: CryptoJS.SHA1,
  sha256: CryptoJS.SHA256,
  sha512: CryptoJS.SHA512,
  md5: CryptoJS.MD5,
};

/**
 * HMAC 签名
 * @param data 要签名的数据
 * @param key 签名密钥
 * @param algorithm 哈希算法，默认 'sha256'
 * @returns HMAC 签名（十六进制字符串）
 */
export function hmacSign(
  data: string,
  key: string,
  algorithm: HMACAlgorithm = 'sha256'
): string {
  const hashFunction = HASH_FUNCTION_MAP[algorithm] || CryptoJS.SHA256;
  const hmac = CryptoJS.HmacSHA256(data, key);

  // 根据算法选择对应的哈希函数
  switch (algorithm) {
    case 'sha1':
      return CryptoJS.HmacSHA1(data, key).toString();
    case 'sha256':
      return CryptoJS.HmacSHA256(data, key).toString();
    case 'sha512':
      return CryptoJS.HmacSHA512(data, key).toString();
    case 'md5':
      return CryptoJS.HmacMD5(data, key).toString();
    default:
      return CryptoJS.HmacSHA256(data, key).toString();
  }
}

/**
 * HMAC 验证
 * @param data 原始数据
 * @param signature 签名
 * @param key 签名密钥
 * @param algorithm 哈希算法，默认 'sha256'
 * @returns 是否验证通过
 */
export function hmacVerify(
  data: string,
  signature: string,
  key: string,
  algorithm: HMACAlgorithm = 'sha256'
): boolean {
  try {
    const calculatedSignature = hmacSign(data, key, algorithm);
    return calculatedSignature === signature;
  } catch (error) {
    return false;
  }
}
