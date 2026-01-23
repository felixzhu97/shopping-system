import CryptoJS from 'crypto-js';
import type { AESOptions } from '../types';

/**
 * AES 加密模式映射
 */
const MODE_MAP: Record<string, typeof CryptoJS.mode.CBC> = {
  CBC: CryptoJS.mode.CBC,
  ECB: CryptoJS.mode.ECB,
  CFB: CryptoJS.mode.CFB,
  OFB: CryptoJS.mode.OFB,
  CTR: CryptoJS.mode.CTR,
};

/**
 * AES 填充模式映射
 */
const PADDING_MAP: Record<string, typeof CryptoJS.pad.Pkcs7> = {
  Pkcs7: CryptoJS.pad.Pkcs7,
  AnsiX923: CryptoJS.pad.AnsiX923,
  Iso10126: CryptoJS.pad.Iso10126,
  Iso97971: CryptoJS.pad.Iso97971,
  ZeroPadding: CryptoJS.pad.ZeroPadding,
  NoPadding: CryptoJS.pad.NoPadding,
};

/**
 * AES 加密
 * @param data 要加密的数据
 * @param key 加密密钥
 * @param options 加密选项
 * @returns 加密后的字符串
 */
export function aesEncrypt(data: string, key: string, options: AESOptions = {}): string {
  const { mode = 'CBC', padding = 'Pkcs7', iv: customIv } = options;

  // 如果提供了自定义 IV，使用它；否则使用 CryptoJS 默认行为（自动生成 salt 和 IV）
  if (customIv) {
    const keyWords = CryptoJS.enc.Utf8.parse(key);
    const modeInstance = MODE_MAP[mode] || CryptoJS.mode.CBC;
    const paddingInstance = PADDING_MAP[padding] || CryptoJS.pad.Pkcs7;

    return CryptoJS.AES.encrypt(data, keyWords, {
      iv: CryptoJS.enc.Utf8.parse(customIv),
      mode: modeInstance,
      padding: paddingInstance,
    }).toString();
  }

  // 使用 CryptoJS 默认行为（最简单）
  return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * AES 解密
 * @param encryptedData 加密的数据
 * @param key 解密密钥
 * @param options 解密选项
 * @returns 解密后的字符串
 */
export function aesDecrypt(encryptedData: string, key: string, options: AESOptions = {}): string {
  const { iv: customIv } = options;

  try {
    // 如果提供了自定义 IV，使用它；否则使用 CryptoJS 默认行为
    if (customIv) {
      const keyWords = CryptoJS.enc.Utf8.parse(key);
      const modeInstance = MODE_MAP[options.mode || 'CBC'] || CryptoJS.mode.CBC;
      const paddingInstance = PADDING_MAP[options.padding || 'Pkcs7'] || CryptoJS.pad.Pkcs7;

      const decrypted = CryptoJS.AES.decrypt(encryptedData, keyWords, {
        iv: CryptoJS.enc.Utf8.parse(customIv),
        mode: modeInstance,
        padding: paddingInstance,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      // 空字符串是有效结果，只有当 sigBytes <= 0 时才认为是失败
      if (decryptedText === '' && decrypted.sigBytes <= 0) {
        throw new Error('解密失败：无法解析解密后的数据');
      }
      return decryptedText;
    }

    // 使用 CryptoJS 默认行为（最简单）
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // 检查解密是否成功
    // 如果 sigBytes <= 0，说明解密失败（可能是密钥错误或数据无效）
    // 但空字符串是特殊情况：加密空字符串后解密，sigBytes 可能为 0 但结果是正确的
    if (decrypted.sigBytes <= 0) {
      // 如果原始数据可能是空字符串，我们需要特殊处理
      // 但无法区分，所以如果 sigBytes <= 0 且结果为空，认为是失败
      if (decryptedText === '') {
        // 尝试验证：如果加密数据看起来有效，可能是空字符串
        // 否则认为是解密失败
        if (encryptedData.length < 20) {
          // 太短，可能是无效数据
          throw new Error('解密失败：无法解析解密后的数据');
        }
        // 可能是空字符串，返回空字符串
        return '';
      }
      throw new Error('解密失败：无法解析解密后的数据');
    }

    return decryptedText;
  } catch (error) {
    throw new Error(`AES 解密失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
