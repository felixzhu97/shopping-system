/**
 * URL 处理工具函数
 */

/**
 * 解析 URL 查询参数
 */
export function parseQueryParams(url: string | URL): Record<string, string> {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * 从 URL 中提取授权码
 */
export function extractCodeFromUrl(url: string | URL): string | null {
  const params = parseQueryParams(url);
  return params.code || null;
}

/**
 * 从 URL 中提取 state 参数
 */
export function extractStateFromUrl(url: string | URL): string | null {
  const params = parseQueryParams(url);
  return params.state || null;
}

/**
 * 从 URL 中提取错误信息
 */
export function extractErrorFromUrl(url: string | URL): {
  error: string;
  errorDescription?: string;
} | null {
  const params = parseQueryParams(url);
  if (params.error) {
    return {
      error: params.error,
      errorDescription: params.error_description,
    };
  }
  return null;
}

/**
 * 构建查询字符串
 */
export function buildQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}

/**
 * 生成随机 state 字符串
 */
export function generateState(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let state = '';
  for (let i = 0; i < length; i++) {
    state += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return state;
}

/**
 * 生成 PKCE code verifier
 */
export function generateCodeVerifier(length: number = 128): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < length; i++) {
    verifier += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return verifier;
}

/**
 * 生成 PKCE code challenge
 * 使用 SHA-256 哈希并 Base64 URL 编码
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  let digest: ArrayBuffer;

  // 浏览器环境
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    digest = await window.crypto.subtle.digest('SHA-256', data);
  }
  // Node.js 环境
  else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  }
  // Node.js 环境（使用 crypto 模块）
  else if (typeof require !== 'undefined') {
    const crypto = require('crypto');
    digest = crypto.createHash('sha256').update(verifier).digest();
  } else {
    throw new Error('Crypto API is not available');
  }

  // Base64 URL 编码
  const bytes = new Uint8Array(digest);
  const base64 = Buffer ? Buffer.from(bytes).toString('base64') : btoa(String.fromCharCode(...bytes));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * 验证回调 URL 是否有效
 */
export function isValidCallbackUrl(url: string, expectedRedirectUri: string): boolean {
  try {
    const urlObj = new URL(url);
    const expectedObj = new URL(expectedRedirectUri);
    
    // 比较协议、主机和路径
    return (
      urlObj.protocol === expectedObj.protocol &&
      urlObj.host === expectedObj.host &&
      urlObj.pathname === expectedObj.pathname
    );
  } catch {
    return false;
  }
}
