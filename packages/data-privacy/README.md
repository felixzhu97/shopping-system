# 数据隐私工具包

提供完整的数据隐私保护功能，包括数据匿名化、PII检测、同意管理、数据最小化、保留策略、去标识化和审计日志等，支持 GDPR、CCPA 等隐私法规合规。

## 功能特性

- **PII 检测和分类**: 自动检测文本中的个人身份信息，并按敏感级别分类
- **数据匿名化**: k-匿名化、数据泛化、数据抑制
- **数据最小化**: 字段过滤、数据清理
- **数据去标识化**: Tokenization、假名化
- **同意管理**: 用户同意记录、状态管理、同意撤回
- **数据保留策略**: 数据过期管理、自动删除
- **审计日志**: 数据访问、修改、删除等操作的完整记录

## 安装

```bash
pnpm add data-privacy
```

## 快速开始

### PII 检测

```typescript
import { detectPII, hasPII, PIIType } from 'data-privacy';

// 检测文本中的 PII
const text = 'Contact me at 13812345678 or test@example.com';
const detected = detectPII(text);

console.log(detected);
// [
//   { type: 'phone', value: '13812345678', sensitivity: 'direct_identifier', ... },
//   { type: 'email', value: 'test@example.com', sensitivity: 'direct_identifier', ... }
// ]

// 检查是否包含 PII
if (hasPII(text)) {
  console.log('Text contains PII');
}

// 只检测特定类型的 PII
const emails = detectPII(text, { types: [PIIType.EMAIL] });
```

### 数据匿名化

```typescript
import { kAnonymize, generalizeObject, suppressFields } from 'data-privacy';

// k-匿名化
const data = [
  { age: 25, zipcode: '10001', disease: 'flu' },
  { age: 26, zipcode: '10001', disease: 'flu' },
  { age: 27, zipcode: '10002', disease: 'cancer' },
];

const anonymized = kAnonymize(data, {
  k: 2,
  quasiIdentifiers: ['age', 'zipcode'],
  sensitiveFields: ['disease'],
  generalizationRules: [
    { field: 'age', level: 'partial' },
  ],
});

// 数据泛化
const generalized = generalizeObject(
  { age: 25, region: '北京市朝阳区' },
  [
    { field: 'age', level: 'partial' },
    { field: 'region', level: 'minimal' },
  ]
);

// 数据抑制
const suppressed = suppressFields(
  { name: 'John', email: 'john@example.com', phone: '13812345678' },
  { fields: ['email', 'phone'], method: 'remove' }
);
```

### 数据最小化

```typescript
import { filterFields, cleanData, removeEmptyValues } from 'data-privacy';

// 字段过滤
const filtered = filterFields(
  { name: 'John', email: 'john@example.com', phone: '13812345678' },
  { include: ['name', 'email'] }
);

// 数据清理
const cleaned = cleanData(
  { name: 'John', email: '', phone: null, address: undefined },
  { removeEmpty: true, removeNull: true, removeUndefined: true }
);

// 移除空值
const withoutEmpty = removeEmptyValues({
  name: 'John',
  email: '',
  phone: null,
});
```

### 数据去标识化

```typescript
import { tokenize, detokenize, pseudonymize } from 'data-privacy';

// Tokenization（不可逆）
const token = tokenize('sensitive-data', { format: 'hash' });
console.log(token); // SHA256 hash

// 可逆 Tokenization
const encryptionKey = 'your-secret-key';
const reversibleToken = tokenize('sensitive-data', {
  reversible: true,
  encryptionKey,
});
const original = detokenize(reversibleToken, encryptionKey);

// 假名化
const pseudonym = pseudonymize('user-id-123', {
  prefix: 'usr_',
  suffix: '_anon',
});
```

### 同意管理

```typescript
import {
  createConsentManager,
  ConsentPurpose,
  ConsentStatus,
} from 'data-privacy';

const manager = createConsentManager();

// 授予同意
await manager.grantConsent('user123', ConsentPurpose.MARKETING);

// 检查是否已同意
const hasConsent = await manager.hasConsent('user123', ConsentPurpose.MARKETING);
if (hasConsent) {
  // 执行营销操作
}

// 撤回同意
await manager.withdrawConsent('user123', ConsentPurpose.MARKETING);

// 获取同意状态
const status = await manager.getConsentStatus('user123', ConsentPurpose.MARKETING);
console.log(status); // 'granted' | 'denied' | 'withdrawn' | 'not_set'
```

### 数据保留策略

```typescript
import {
  isExpired,
  shouldDelete,
  createRetentionScheduler,
} from 'data-privacy';

// 定义保留策略
const policy = {
  id: 'user-data-policy',
  name: 'User Data Retention',
  retentionDays: 30,
  autoDelete: true,
  dataTypes: ['user_data'],
};

// 检查数据是否过期
const metadata = {
  id: 'user123',
  type: 'user_data',
  createdAt: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
};

if (isExpired(metadata, policy)) {
  console.log('Data is expired');
}

// 创建调度器（需要实现 DataItemAccessor）
const scheduler = createRetentionScheduler(accessor);
scheduler.addPolicy(policy);
scheduler.start(); // 自动执行删除
```

### 审计日志

```typescript
import { createAuditLogger, AuditAction } from 'data-privacy';

const logger = createAuditLogger();

// 记录操作
await logger.logView('user123', 'order', 'order456', {
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

await logger.logCreate('user123', 'order', 'order789');
await logger.logUpdate('user123', 'order', 'order789');
await logger.logDelete('user123', 'order', 'order789');

// 查询日志
const logs = await logger.query({
  userId: 'user123',
  action: AuditAction.VIEW,
  startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // Last 7 days
});

// 获取日志总数
const count = await logger.count({ userId: 'user123' });
```

## API 参考

### PII 检测

#### `detectPII(text: string, options?: PIIDetectionOptions): DetectedPII[]`

检测文本中的 PII。

- `text`: 要检测的文本
- `options`: 检测选项
  - `types`: 要检测的 PII 类型列表
  - `minConfidence`: 最小置信度阈值
  - `detailed`: 是否返回详细信息
- 返回: 检测到的 PII 列表

#### `hasPII(text: string, options?: PIIDetectionOptions): boolean`

检查文本是否包含 PII。

#### `countPII(text: string, options?: PIIDetectionOptions): Record<PIIType, number>`

统计文本中各种类型 PII 的数量。

### 数据匿名化

#### `kAnonymize(data: Record<string, unknown>[], options: KAnonymityOptions): Record<string, unknown>[]`

实现 k-匿名化。

- `data`: 要匿名化的数据
- `options`: k-匿名化选项
  - `k`: k 值
  - `quasiIdentifiers`: 准标识符字段列表
  - `sensitiveFields`: 敏感字段列表
  - `generalizationRules`: 泛化规则
- 返回: k-匿名化后的数据

#### `generalizeObject(obj: Record<string, unknown>, rules: GeneralizationRule[]): Record<string, unknown>`

泛化对象中的字段。

#### `suppressFields(obj: Record<string, unknown>, options: SuppressionOptions): Record<string, unknown>`

抑制对象中的字段。

### 数据最小化

#### `filterFields(obj: Record<string, unknown>, options: FieldFilterOptions): Record<string, unknown>`

过滤对象字段。

#### `cleanData(obj: Record<string, unknown>, options?: DataCleaningOptions): Record<string, unknown>`

清理数据。

### 数据去标识化

#### `tokenize(value: string, options?: TokenizationOptions): string`

将值转换为 token。

#### `pseudonymize(value: string, options?: PseudonymizationOptions): string`

将值转换为假名。

### 同意管理

#### `createConsentManager(storage?: ConsentStorageAdapter): ConsentManager`

创建同意管理器。

#### `manager.grantConsent(userId: string, purpose: ConsentPurpose): Promise<ConsentRecord>`

授予同意。

#### `manager.hasConsent(userId: string, purpose: ConsentPurpose): Promise<boolean>`

检查是否已同意。

### 数据保留策略

#### `isExpired(metadata: DataItemMetadata, policy: RetentionPolicy): boolean`

检查数据是否已过期。

#### `createRetentionScheduler(accessor: DataItemAccessor, options?: RetentionSchedulerOptions): RetentionScheduler`

创建保留策略调度器。

### 审计日志

#### `createAuditLogger(storage?: AuditLogStorageAdapter): AuditLogger`

创建审计日志记录器。

#### `logger.logView(userId: string, resourceType: string, resourceId: string, options?): Promise<AuditLogEntry>`

记录查看操作。

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
   - 大数据量处理时考虑使用批处理
   - k-匿名化算法复杂度较高，注意性能影响

3. **安全性**:
   - 可逆 tokenization 和假名化需要妥善保管密钥
   - 审计日志应存储在安全的位置
   - 定期审查和清理审计日志

4. **合规性**:
   - 确保同意管理符合 GDPR、CCPA 等法规要求
   - 数据保留策略应与法律要求一致
   - 审计日志应满足合规审查需求

## 许可证

MIT
