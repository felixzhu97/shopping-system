/**
 * 数据安全工具包类型定义
 */

/**
 * AES 加密选项
 */
export interface AESOptions {
  /**
   * 加密模式，默认 'CBC'
   */
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR';
  /**
   * 填充模式，默认 'Pkcs7'
   */
  padding?: 'Pkcs7' | 'AnsiX923' | 'Iso10126' | 'Iso97971' | 'ZeroPadding' | 'NoPadding';
  /**
   * 初始化向量（IV），如果不提供会自动生成
   */
  iv?: string;
}

/**
 * RSA 加密选项
 */
export interface RSAOptions {
  /**
   * 填充方案，默认 'RSA_PKCS1_PADDING'
   */
  padding?: 'RSA_PKCS1_PADDING' | 'RSA_NO_PADDING' | 'RSA_PKCS1_OAEP_PADDING';
}

/**
 * 脱敏选项
 */
export interface MaskingOptions {
  /**
   * 脱敏字符，默认 '*'
   */
  maskChar?: string;
  /**
   * 保留前缀长度
   */
  prefixLength?: number;
  /**
   * 保留后缀长度
   */
  suffixLength?: number;
}

/**
 * HMAC 算法类型
 */
export type HMACAlgorithm = 'sha1' | 'sha256' | 'sha512' | 'md5';

/**
 * JWT 签名选项
 */
export interface JWTOptions {
  /**
   * 过期时间，例如 '1h', '7d', '30 days'
   */
  expiresIn?: string | number;
  /**
   * 签发时间
   */
  issuedAt?: number | Date;
  /**
   * 受众
   */
  audience?: string | string[];
  /**
   * 签发者
   */
  issuer?: string;
  /**
   * 主题
   */
  subject?: string;
  /**
   * JWT ID
   */
  jwtid?: string;
  /**
   * 不在此之前生效
   */
  notBefore?: string | number;
}

/**
 * JWT 载荷
 */
export interface JWTPayload {
  [key: string]: unknown;
  /**
   * 过期时间
   */
  exp?: number;
  /**
   * 签发时间
   */
  iat?: number;
  /**
   * 受众
   */
  aud?: string | string[];
  /**
   * 签发者
   */
  iss?: string;
  /**
   * 主题
   */
  sub?: string;
  /**
   * JWT ID
   */
  jti?: string;
  /**
   * 不在此之前生效
   */
  nbf?: number;
}

/**
 * 存储适配器接口（兼容 Web Storage API）
 */
export interface StorageAdapter {
  /**
   * 获取存储项
   */
  getItem(key: string): string | null;
  /**
   * 设置存储项
   */
  setItem(key: string, value: string): void;
  /**
   * 删除存储项
   */
  removeItem(key: string): void;
  /**
   * 清空所有存储项
   */
  clear?(): void;
  /**
   * 获取存储项数量
   */
  length?: number;
  /**
   * 获取指定索引的键名
   */
  key?: (index: number) => string | null;
}

/**
 * 加密存储选项
 */
export interface EncryptedStorageOptions {
  /**
   * 加密密钥
   */
  encryptionKey: string;
  /**
   * 底层存储适配器（浏览器环境默认为 localStorage）
   */
  storage?: StorageAdapter;
  /**
   * AES 加密选项
   */
  encryptionOptions?: AESOptions;
}

/**
 * 环境检测结果
 */
export interface EnvironmentInfo {
  /**
   * 是否为浏览器环境
   */
  isBrowser: boolean;
  /**
   * 是否为 Node.js 环境
   */
  isNode: boolean;
}

/**
 * RSA 密钥对
 */
export interface RSAKeyPair {
  /**
   * 公钥
   */
  publicKey: string;
  /**
   * 私钥
   */
  privateKey: string;
}
