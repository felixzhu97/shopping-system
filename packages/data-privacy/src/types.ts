/**
 * 数据隐私工具包类型定义
 */

/**
 * PII 类型枚举
 */
export enum PIIType {
  /** 手机号 */
  PHONE = 'phone',
  /** 邮箱 */
  EMAIL = 'email',
  /** 身份证号 */
  ID_CARD = 'id_card',
  /** 银行卡号 */
  BANK_CARD = 'bank_card',
  /** 姓名 */
  NAME = 'name',
  /** IP 地址 */
  IP_ADDRESS = 'ip_address',
  /** 地址 */
  ADDRESS = 'address',
  /** 日期/生日 */
  DATE_OF_BIRTH = 'date_of_birth',
  /** 护照号 */
  PASSPORT = 'passport',
  /** 驾驶证号 */
  DRIVER_LICENSE = 'driver_license',
  /** 社保号 */
  SSN = 'ssn',
}

/**
 * PII 敏感级别
 */
export enum PIISensitivity {
  /** 直接标识符：可直接识别个人身份 */
  DIRECT_IDENTIFIER = 'direct_identifier',
  /** 准标识符：与其他信息结合可识别个人 */
  QUASI_IDENTIFIER = 'quasi_identifier',
  /** 敏感信息：包含敏感个人数据 */
  SENSITIVE = 'sensitive',
}

/**
 * 检测到的 PII 信息
 */
export interface DetectedPII {
  /** PII 类型 */
  type: PIIType;
  /** 敏感级别 */
  sensitivity: PIISensitivity;
  /** 检测到的值 */
  value: string;
  /** 在文本中的起始位置 */
  startIndex: number;
  /** 在文本中的结束位置 */
  endIndex: number;
  /** 置信度 (0-1) */
  confidence?: number;
}

/**
 * PII 检测选项
 */
export interface PIIDetectionOptions {
  /** 要检测的 PII 类型列表，为空则检测所有类型 */
  types?: PIIType[];
  /** 最小置信度阈值 */
  minConfidence?: number;
  /** 是否返回详细信息 */
  detailed?: boolean;
}

/**
 * 数据泛化级别
 */
export enum GeneralizationLevel {
  /** 完全泛化 */
  FULL = 'full',
  /** 部分泛化 */
  PARTIAL = 'partial',
  /** 轻微泛化 */
  MINIMAL = 'minimal',
}

/**
 * 泛化规则
 */
export interface GeneralizationRule {
  /** 字段名 */
  field: string;
  /** 泛化级别 */
  level: GeneralizationLevel;
  /** 自定义泛化函数 */
  customFn?: (value: unknown) => unknown;
}

/**
 * k-匿名化选项
 */
export interface KAnonymityOptions {
  /** k 值（至少 k 条记录无法区分） */
  k: number;
  /** 准标识符字段列表 */
  quasiIdentifiers: string[];
  /** 敏感字段列表 */
  sensitiveFields?: string[];
  /** 泛化规则 */
  generalizationRules?: GeneralizationRule[];
}

/**
 * 数据抑制选项
 */
export interface SuppressionOptions {
  /** 要抑制的字段列表 */
  fields: string[];
  /** 抑制方式：'remove' 删除字段，'mask' 掩码显示 */
  method?: 'remove' | 'mask';
  /** 掩码字符（当 method 为 'mask' 时使用） */
  maskChar?: string;
}

/**
 * 字段过滤选项
 */
export interface FieldFilterOptions {
  /** 要保留的字段列表 */
  include?: string[];
  /** 要排除的字段列表 */
  exclude?: string[];
  /** 是否深度过滤（处理嵌套对象） */
  deep?: boolean;
}

/**
 * 数据清理选项
 */
export interface DataCleaningOptions {
  /** 是否移除空值 */
  removeEmpty?: boolean;
  /** 是否移除 null 值 */
  removeNull?: boolean;
  /** 是否移除 undefined 值 */
  removeUndefined?: boolean;
  /** 是否移除重复项 */
  removeDuplicates?: boolean;
  /** 自定义清理函数 */
  customCleaner?: (value: unknown) => boolean;
}

/**
 * Tokenization 选项
 */
export interface TokenizationOptions {
  /** 是否可逆 */
  reversible?: boolean;
  /** 加密密钥（用于可逆 tokenization） */
  encryptionKey?: string;
  /** Token 格式：'uuid' | 'hash' | 'numeric' */
  format?: 'uuid' | 'hash' | 'numeric';
  /** Token 长度（当 format 为 'numeric' 时使用） */
  length?: number;
}

/**
 * 假名化选项
 */
export interface PseudonymizationOptions {
  /** 是否可逆 */
  reversible?: boolean;
  /** 加密密钥（用于可逆假名化） */
  encryptionKey?: string;
  /** 假名前缀 */
  prefix?: string;
  /** 假名后缀 */
  suffix?: string;
}

/**
 * 同意目的类型
 */
export enum ConsentPurpose {
  /** 营销 */
  MARKETING = 'marketing',
  /** 分析 */
  ANALYTICS = 'analytics',
  /** 功能必需 */
  FUNCTIONAL = 'functional',
  /** 个性化 */
  PERSONALIZATION = 'personalization',
  /** 第三方分享 */
  THIRD_PARTY_SHARING = 'third_party_sharing',
}

/**
 * 同意状态
 */
export enum ConsentStatus {
  /** 已同意 */
  GRANTED = 'granted',
  /** 已拒绝 */
  DENIED = 'denied',
  /** 未设置 */
  NOT_SET = 'not_set',
  /** 已撤回 */
  WITHDRAWN = 'withdrawn',
}

/**
 * 同意记录
 */
export interface ConsentRecord {
  /** 用户 ID */
  userId: string;
  /** 同意目的 */
  purpose: ConsentPurpose;
  /** 同意状态 */
  status: ConsentStatus;
  /** 同意时间 */
  timestamp: number;
  /** 撤回时间（如果已撤回） */
  withdrawnAt?: number;
  /** 版本号 */
  version?: string;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 同意存储适配器接口
 */
export interface ConsentStorageAdapter {
  /** 保存同意记录 */
  save(record: ConsentRecord): Promise<void>;
  /** 获取同意记录 */
  get(userId: string, purpose: ConsentPurpose): Promise<ConsentRecord | null>;
  /** 获取用户的所有同意记录 */
  getAll(userId: string): Promise<ConsentRecord[]>;
  /** 删除同意记录 */
  delete(userId: string, purpose: ConsentPurpose): Promise<void>;
}

/**
 * 数据保留策略
 */
export interface RetentionPolicy {
  /** 策略 ID */
  id: string;
  /** 策略名称 */
  name: string;
  /** 数据保留期限（天数） */
  retentionDays: number;
  /** 适用的数据类型或字段 */
  dataTypes?: string[];
  /** 是否自动删除 */
  autoDelete?: boolean;
  /** 删除前的通知时间（天数） */
  notifyBeforeDays?: number;
  /** 额外配置 */
  config?: Record<string, unknown>;
}

/**
 * 数据项元数据（用于保留策略）
 */
export interface DataItemMetadata {
  /** 数据项 ID */
  id: string;
  /** 数据类型 */
  type: string;
  /** 创建时间 */
  createdAt: number;
  /** 最后修改时间 */
  updatedAt?: number;
  /** 过期时间 */
  expiresAt?: number;
  /** 额外元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 保留策略调度器选项
 */
export interface RetentionSchedulerOptions {
  /** 检查间隔（毫秒） */
  checkInterval?: number;
  /** 批处理大小 */
  batchSize?: number;
  /** 是否启用自动调度 */
  enabled?: boolean;
}

/**
 * 审计日志操作类型
 */
export enum AuditAction {
  /** 查看 */
  VIEW = 'view',
  /** 创建 */
  CREATE = 'create',
  /** 更新 */
  UPDATE = 'update',
  /** 删除 */
  DELETE = 'delete',
  /** 导出 */
  EXPORT = 'export',
  /** 访问 */
  ACCESS = 'access',
}

/**
 * 审计日志条目
 */
export interface AuditLogEntry {
  /** 日志 ID */
  id: string;
  /** 用户 ID */
  userId: string;
  /** 操作类型 */
  action: AuditAction;
  /** 资源类型 */
  resourceType: string;
  /** 资源 ID */
  resourceId: string;
  /** 操作时间 */
  timestamp: number;
  /** IP 地址 */
  ipAddress?: string;
  /** 用户代理 */
  userAgent?: string;
  /** 操作详情 */
  details?: Record<string, unknown>;
  /** 操作结果：'success' | 'failure' */
  result?: 'success' | 'failure';
  /** 错误信息（如果失败） */
  error?: string;
}

/**
 * 审计日志查询选项
 */
export interface AuditLogQueryOptions {
  /** 用户 ID */
  userId?: string;
  /** 操作类型 */
  action?: AuditAction;
  /** 资源类型 */
  resourceType?: string;
  /** 资源 ID */
  resourceId?: string;
  /** 开始时间 */
  startTime?: number;
  /** 结束时间 */
  endTime?: number;
  /** 分页：页码 */
  page?: number;
  /** 分页：每页数量 */
  pageSize?: number;
  /** 排序字段 */
  sortBy?: 'timestamp' | 'userId' | 'action';
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 审计日志存储适配器接口
 */
export interface AuditLogStorageAdapter {
  /** 保存日志条目 */
  save(entry: AuditLogEntry): Promise<void>;
  /** 查询日志 */
  query(options: AuditLogQueryOptions): Promise<AuditLogEntry[]>;
  /** 获取日志总数 */
  count(options: AuditLogQueryOptions): Promise<number>;
  /** 删除日志 */
  delete(id: string): Promise<void>;
  /** 批量删除日志 */
  deleteMany(ids: string[]): Promise<void>;
}
