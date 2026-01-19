import type { RSAOptions, RSAKeyPair } from '../types';

/**
 * 检查是否为 Node.js 环境
 */
function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

/**
 * RSA 加密（仅 Node.js）
 * @param data 要加密的数据
 * @param publicKey 公钥（PEM 格式）
 * @param options 加密选项
 * @returns 加密后的 Base64 字符串
 */
export function rsaEncrypt(
  data: string,
  publicKey: string,
  options: RSAOptions = {}
): string {
  if (!isNodeEnvironment()) {
    throw new Error('RSA 加密仅在 Node.js 环境中可用。请使用 AES 加密替代。');
  }

  // 动态导入 Node.js crypto 模块
  const crypto = require('crypto');

  const { padding = 'RSA_PKCS1_PADDING' } = options;

  try {
    // 将填充方案转换为 Node.js 常量
    let paddingConstant: number;
    switch (padding) {
      case 'RSA_PKCS1_PADDING':
        paddingConstant = crypto.constants.RSA_PKCS1_PADDING;
        break;
      case 'RSA_NO_PADDING':
        paddingConstant = crypto.constants.RSA_NO_PADDING;
        break;
      case 'RSA_PKCS1_OAEP_PADDING':
        paddingConstant = crypto.constants.RSA_PKCS1_OAEP_PADDING;
        break;
      default:
        paddingConstant = crypto.constants.RSA_PKCS1_PADDING;
    }

    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: paddingConstant,
      },
      buffer
    );

    return encrypted.toString('base64');
  } catch (error) {
    throw new Error(`RSA 加密失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * RSA 解密（仅 Node.js）
 * @param encryptedData 加密的数据（Base64 字符串）
 * @param privateKey 私钥（PEM 格式）
 * @param options 解密选项
 * @returns 解密后的字符串
 */
export function rsaDecrypt(
  encryptedData: string,
  privateKey: string,
  options: RSAOptions = {}
): string {
  if (!isNodeEnvironment()) {
    throw new Error('RSA 解密仅在 Node.js 环境中可用。请使用 AES 解密替代。');
  }

  // 动态导入 Node.js crypto 模块
  const crypto = require('crypto');

  const { padding = 'RSA_PKCS1_PADDING' } = options;

  try {
    // 将填充方案转换为 Node.js 常量
    let paddingConstant: number;
    switch (padding) {
      case 'RSA_PKCS1_PADDING':
        paddingConstant = crypto.constants.RSA_PKCS1_PADDING;
        break;
      case 'RSA_NO_PADDING':
        paddingConstant = crypto.constants.RSA_NO_PADDING;
        break;
      case 'RSA_PKCS1_OAEP_PADDING':
        paddingConstant = crypto.constants.RSA_PKCS1_OAEP_PADDING;
        break;
      default:
        paddingConstant = crypto.constants.RSA_PKCS1_PADDING;
    }

    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: paddingConstant,
      },
      buffer
    );

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`RSA 解密失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 生成 RSA 密钥对（仅 Node.js）
 * @param keySize 密钥大小（位），默认 2048
 * @returns RSA 密钥对
 */
export function generateRSAKeyPair(keySize: number = 2048): RSAKeyPair {
  if (!isNodeEnvironment()) {
    throw new Error('RSA 密钥对生成仅在 Node.js 环境中可用。');
  }

  // 动态导入 Node.js crypto 模块
  const crypto = require('crypto');

  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return {
      publicKey,
      privateKey,
    };
  } catch (error) {
    throw new Error(
      `RSA 密钥对生成失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
