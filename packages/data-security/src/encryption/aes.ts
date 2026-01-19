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
export function aesEncrypt(
  data: string,
  key: string,
  options: AESOptions = {}
): string {
  const {
    mode = 'CBC',
    padding = 'Pkcs7',
    iv: customIv,
  } = options;

  // 解析密钥
  const keyWords = CryptoJS.enc.Utf8.parse(key);

  // 获取加密模式和填充模式
  const modeInstance = MODE_MAP[mode] || CryptoJS.mode.CBC;
  const paddingInstance = PADDING_MAP[padding] || CryptoJS.pad.Pkcs7;

  // 生成或使用提供的 IV
  const iv = customIv
    ? CryptoJS.enc.Utf8.parse(customIv)
    : CryptoJS.lib.WordArray.random(128 / 8);

  // 执行加密
  const encrypted = CryptoJS.AES.encrypt(data, keyWords, {
    iv,
    mode: modeInstance,
    padding: paddingInstance,
  });

  // 当使用随机 IV 时，需要将 IV 和加密数据一起保存
  // 格式：iv:encryptedData（Base64 编码）
  if (!customIv) {
    const ivBase64 = CryptoJS.enc.Base64.stringify(iv);
    const encryptedBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    return `${ivBase64}:${encryptedBase64}`;
  }

  // 如果提供了自定义 IV，直接返回加密结果
  return encrypted.toString();
}

/**
 * AES 解密
 * @param encryptedData 加密的数据
 * @param key 解密密钥
 * @param options 解密选项
 * @returns 解密后的字符串
 */
export function aesDecrypt(
  encryptedData: string,
  key: string,
  options: AESOptions = {}
): string {
  const {
    mode = 'CBC',
    padding = 'Pkcs7',
    iv: customIv,
  } = options;

  try {
    // 解析密钥
    const keyWords = CryptoJS.enc.Utf8.parse(key);

    // 获取解密模式和填充模式
    const modeInstance = MODE_MAP[mode] || CryptoJS.mode.CBC;
    const paddingInstance = PADDING_MAP[padding] || CryptoJS.pad.Pkcs7;

    let decrypted: CryptoJS.lib.WordArray;

    // 检查加密数据格式：如果是 "iv:encryptedData" 格式，说明使用了随机 IV
    if (!customIv && encryptedData.includes(':')) {
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('解密失败：无效的加密数据格式');
      }
      
      const [ivBase64, encryptedBase64] = parts;
      const decryptIv = CryptoJS.enc.Base64.parse(ivBase64);
      const ciphertext = CryptoJS.enc.Base64.parse(encryptedBase64);
      
      // 创建 CipherParams 对象
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext,
      });
      
      // 使用提取的 IV 进行解密
      decrypted = CryptoJS.AES.decrypt(cipherParams, keyWords, {
        iv: decryptIv,
        mode: modeInstance,
        padding: paddingInstance,
      });
    } else if (!customIv) {
      // 尝试使用 OpenSSL 格式解密（向后兼容）
      decrypted = CryptoJS.AES.decrypt(encryptedData, keyWords, {
        format: CryptoJS.format.OpenSSL as any,
        mode: modeInstance,
        padding: paddingInstance,
      });
    } else {
      // 使用自定义 IV 或标准格式
      const decryptOptions: any = {
        mode: modeInstance,
        padding: paddingInstance,
      };
      
      if (customIv) {
        decryptOptions.iv = CryptoJS.enc.Utf8.parse(customIv);
      }
      
      decrypted = CryptoJS.AES.decrypt(encryptedData, keyWords, decryptOptions);
    }

    // 转换为字符串
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error('解密失败：无法解析解密后的数据');
    }

    return decryptedText;
  } catch (error) {
    throw new Error(`AES 解密失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
