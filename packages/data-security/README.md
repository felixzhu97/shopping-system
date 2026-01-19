# 数据安全工具包

提供完整的数据安全功能，包括加密/解密、数据脱敏、哈希、签名验证和安全存储等，支持浏览器和 Node.js 环境。

## 功能特性

- **加密/解密**: AES、RSA、Base64
- **哈希**: MD5、SHA 系列（SHA256、SHA512）、bcrypt
- **数据脱敏**: 手机号、邮箱、身份证、银行卡、姓名
- **签名验证**: HMAC、JWT
- **安全存储**: 加密的 localStorage/sessionStorage 适配器

## 安装

```bash
pnpm add data-security
```

对于 Node.js 专用功能（RSA、bcrypt、JWT），需要额外安装 peer dependencies：

```bash
pnpm add bcryptjs jsonwebtoken
```

## 快速开始

### 加密/解密

```typescript
import { aesEncrypt, aesDecrypt } from 'data-security';

// AES 加密
const encrypted = aesEncrypt('敏感数据', 'your-secret-key');
console.log(encrypted);

// AES 解密
const decrypted = aesDecrypt(encrypted, 'your-secret-key');
console.log(decrypted);

// Base64 编码/解码
import { base64Encode, base64Decode } from 'data-security';

const encoded = base64Encode('Hello World');
const decoded = base64Decode(encoded);
```

### 数据脱敏

```typescript
import { maskPhone, maskEmail, maskIdCard, maskBankCard, maskName } from 'data-security';

// 手机号脱敏
maskPhone('13812345678'); // '138****5678'

// 邮箱脱敏
maskEmail('example@domain.com'); // 'exam***@domain.com'

// 身份证脱敏
maskIdCard('110101199001011234'); // '110***********1234'

// 银行卡脱敏
maskBankCard('6222021234567890'); // '6222 **** **** 7890'

// 姓名脱敏
maskName('张三'); // '张*'
maskName('李四'); // '李*'
maskName('王五'); // '王*'
```

### 哈希

```typescript
import { md5, sha256, sha512, hashPassword, verifyPassword } from 'data-security';

// MD5 哈希
const hash = md5('data');

// SHA256 哈希
const sha256Hash = sha256('data');

// SHA512 哈希
const sha512Hash = sha512('data');

// bcrypt 密码哈希（仅 Node.js）
const hashedPassword = await hashPassword('password123');
const isValid = await verifyPassword('password123', hashedPassword);
```

### 签名验证

```typescript
import { hmacSign, hmacVerify, signJWT, verifyJWT } from 'data-security';

// HMAC 签名
const signature = hmacSign('data', 'secret-key', 'sha256');
const isValid = hmacVerify('data', signature, 'secret-key', 'sha256');

// JWT 签名和验证
const token = signJWT({ userId: '123' }, 'secret-key', { expiresIn: '1h' });
const payload = verifyJWT(token, 'secret-key');
```

### 安全存储

```typescript
import { createEncryptedStorage } from 'data-security';

// 创建加密存储适配器
const encryptedStorage = createEncryptedStorage('your-encryption-key');

// 使用方式与 localStorage 相同
encryptedStorage.setItem('key', 'value');
const value = encryptedStorage.getItem('key');
encryptedStorage.removeItem('key');
```

## API 参考

### 加密模块

#### `aesEncrypt(data: string, key: string, options?: AESOptions): string`

AES 加密数据。

- `data`: 要加密的数据
- `key`: 加密密钥
- `options`: 可选的加密选项
- 返回: 加密后的字符串

#### `aesDecrypt(encryptedData: string, key: string, options?: AESOptions): string`

AES 解密数据。

- `encryptedData`: 加密的数据
- `key`: 解密密钥
- `options`: 可选的解密选项
- 返回: 解密后的字符串

#### `base64Encode(data: string): string`

Base64 编码。

#### `base64Decode(encodedData: string): string`

Base64 解码。

### 哈希模块

#### `md5(data: string): string`

计算 MD5 哈希值。

#### `sha256(data: string): string`

计算 SHA256 哈希值。

#### `sha512(data: string): string`

计算 SHA512 哈希值。

#### `hashPassword(password: string, saltRounds?: number): Promise<string>`

使用 bcrypt 哈希密码（仅 Node.js）。

#### `verifyPassword(password: string, hash: string): Promise<boolean>`

验证 bcrypt 哈希密码（仅 Node.js）。

### 数据脱敏模块

#### `maskPhone(phone: string, maskChar?: string): string`

手机号脱敏。

#### `maskEmail(email: string, maskChar?: string): string`

邮箱脱敏。

#### `maskIdCard(idCard: string, maskChar?: string): string`

身份证脱敏。

#### `maskBankCard(cardNumber: string, maskChar?: string): string`

银行卡脱敏。

#### `maskName(name: string, maskChar?: string): string`

姓名脱敏。

### 签名模块

#### `hmacSign(data: string, key: string, algorithm?: string): string`

HMAC 签名。

#### `hmacVerify(data: string, signature: string, key: string, algorithm?: string): boolean`

HMAC 验证。

#### `signJWT(payload: object, secret: string, options?: JWTOptions): string`

JWT 签名（需要 jsonwebtoken）。

#### `verifyJWT(token: string, secret: string): object | null`

JWT 验证（需要 jsonwebtoken）。

### 安全存储模块

#### `createEncryptedStorage(encryptionKey: string): StorageAdapter`

创建加密存储适配器。

- `encryptionKey`: 加密密钥
- 返回: 兼容 localStorage API 的存储适配器

## 环境支持

- **浏览器**: 支持所有现代浏览器
- **Node.js**: 支持 Node.js 18+
- **React Native**: 需要提供存储适配器

## 注意事项

1. **密钥管理**: 
   - 永远不要硬编码密钥
   - 使用环境变量存储密钥
   - 生产环境使用强密钥

2. **性能考虑**:
   - 大数据量加密时考虑使用流式处理
   - bcrypt 哈希有性能开销，合理设置 saltRounds

3. **安全性**:
   - 优先使用 SHA256/SHA512 而非 MD5
   - 密码哈希使用 bcrypt 而非普通哈希
   - 定期更新依赖包

4. **Node.js 专用功能**:
   - RSA、bcrypt、JWT 需要相应的 peer dependencies
   - 浏览器环境会抛出错误提示

## 许可证

MIT
