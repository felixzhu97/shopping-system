// 类型导出
export type {
  AESOptions,
  RSAOptions,
  MaskingOptions,
  HMACAlgorithm,
  JWTOptions,
  JWTPayload,
  StorageAdapter,
  EncryptedStorageOptions,
  EnvironmentInfo,
  RSAKeyPair,
} from './types';

// 加密模块
export { aesEncrypt, aesDecrypt } from './encryption/aes';
export { base64Encode, base64Decode } from './encryption/base64';
export { rsaEncrypt, rsaDecrypt, generateRSAKeyPair } from './encryption/rsa';

// 哈希模块
export { md5 } from './hashing/md5';
export { sha1, sha256, sha512, sha3 } from './hashing/sha';
export { hashPassword, verifyPassword } from './hashing/bcrypt';

// 数据脱敏模块
export { maskPhone } from './masking/phone';
export { maskEmail } from './masking/email';
export { maskIdCard } from './masking/id-card';
export { maskBankCard } from './masking/bank-card';
export { maskName } from './masking/name';

// 签名模块
export { hmacSign, hmacVerify } from './signature/hmac';
export { signJWT, verifyJWT, decodeJWT } from './signature/jwt';

// 安全存储模块
export { createSecureStorage } from './storage/secure-storage';
export { createEncryptedStorage } from './storage/encrypt-storage';
