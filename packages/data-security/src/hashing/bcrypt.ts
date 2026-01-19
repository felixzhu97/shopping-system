import type {} from 'bcryptjs';

/**
 * 检查是否为 Node.js 环境
 */
function isNodeEnvironment(): boolean {
  return typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
}

/**
 * 使用 bcrypt 哈希密码（仅 Node.js）
 * @param password 密码
 * @param saltRounds salt 轮数，默认 10
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
  if (!isNodeEnvironment()) {
    throw new Error('bcrypt 密码哈希仅在 Node.js 环境中可用。请使用 SHA256/SHA512 替代。');
  }

  try {
    // 动态导入 bcryptjs
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'bcryptjs 模块未安装。请运行: pnpm add bcryptjs @types/bcryptjs'
      );
    }
    throw new Error(
      `密码哈希失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * 验证 bcrypt 哈希密码（仅 Node.js）
 * @param password 原始密码
 * @param hash 哈希值
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!isNodeEnvironment()) {
    throw new Error('bcrypt 密码验证仅在 Node.js 环境中可用。');
  }

  try {
    // 动态导入 bcryptjs
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'bcryptjs 模块未安装。请运行: pnpm add bcryptjs @types/bcryptjs'
      );
    }
    throw new Error(
      `密码验证失败: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
