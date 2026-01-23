import type { JWTOptions, JWTPayload } from '../types';

/**
 * 检查是否为 Node.js 环境
 */
function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

/**
 * JWT 签名（需要 jsonwebtoken）
 * @param payload JWT 载荷
 * @param secret 签名密钥
 * @param options JWT 选项
 * @returns JWT token
 */
export function signJWT(
  payload: object,
  secret: string,
  options: JWTOptions = {}
): string {
  if (!isNodeEnvironment()) {
    throw new Error('JWT 签名仅在 Node.js 环境中可用。请使用 HMAC 签名替代。');
  }

  try {
    // 动态导入 jsonwebtoken
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, secret, options);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'jsonwebtoken 模块未安装。请运行: pnpm add jsonwebtoken @types/jsonwebtoken'
      );
    }
    throw new Error(`JWT 签名失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * JWT 验证（需要 jsonwebtoken）
 * @param token JWT token
 * @param secret 签名密钥
 * @returns 解码后的载荷，如果验证失败返回 null
 */
export function verifyJWT(token: string, secret: string): JWTPayload | null {
  if (!isNodeEnvironment()) {
    throw new Error('JWT 验证仅在 Node.js 环境中可用。');
  }

  try {
    // 动态导入 jsonwebtoken
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, secret);
    return decoded as JWTPayload;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'jsonwebtoken 模块未安装。请运行: pnpm add jsonwebtoken @types/jsonwebtoken'
      );
    }
    // JWT 验证失败（过期、签名无效等）
    return null;
  }
}

/**
 * 解码 JWT（不验证签名，仅解码）
 * @param token JWT token
 * @returns 解码后的载荷
 */
export function decodeJWT(token: string): JWTPayload | null {
  if (!isNodeEnvironment()) {
    throw new Error('JWT 解码仅在 Node.js 环境中可用。');
  }

  try {
    // 动态导入 jsonwebtoken
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token, { complete: false });
    return decoded as JWTPayload | null;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'jsonwebtoken 模块未安装。请运行: pnpm add jsonwebtoken @types/jsonwebtoken'
      );
    }
    return null;
  }
}
