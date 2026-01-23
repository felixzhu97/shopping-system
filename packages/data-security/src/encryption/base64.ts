import CryptoJS from 'crypto-js';

/**
 * Base64 编码
 * @param data 要编码的数据
 * @returns Base64 编码后的字符串
 */
export function base64Encode(data: string): string {
  return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
}

/**
 * Base64 解码
 * @param encodedData Base64 编码的数据
 * @returns 解码后的字符串
 */
export function base64Decode(encodedData: string): string {
  try {
    const words = CryptoJS.enc.Base64.parse(encodedData);
    return CryptoJS.enc.Utf8.stringify(words);
  } catch (error) {
    throw new Error(`Base64 解码失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
