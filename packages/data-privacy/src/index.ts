/**
 * 数据隐私工具包主入口
 * 提供完整的数据隐私保护功能，包括数据匿名化、PII检测、同意管理、数据最小化、保留策略、去标识化和审计日志等
 */

// 类型导出
export type {
  PIIType,
  PIISensitivity,
  DetectedPII,
  PIIDetectionOptions,
  GeneralizationLevel,
  GeneralizationRule,
  KAnonymityOptions,
  SuppressionOptions,
  FieldFilterOptions,
  DataCleaningOptions,
  TokenizationOptions,
  PseudonymizationOptions,
  ConsentPurpose,
  ConsentStatus,
  ConsentRecord,
  ConsentStorageAdapter,
  RetentionPolicy,
  DataItemMetadata,
  RetentionSchedulerOptions,
  AuditAction,
  AuditLogEntry,
  AuditLogQueryOptions,
  AuditLogStorageAdapter,
} from './types';

// PII 检测模块
export {
  detectPII,
  detectPIIInObject,
  hasPII,
  countPII,
} from './pii/detector';
export {
  classifyPII,
  classifyPIIList,
  groupPIIBySensitivity,
  groupPIIByType,
} from './pii/classifier';
export {
  PII_PATTERNS,
  getPatternsByType,
  getAllPatterns,
  type PIIPattern,
} from './pii/patterns';

// 数据匿名化模块
export {
  kAnonymize,
  checkKAnonymity,
  getKAnonymityStats,
} from './anonymization/k-anonymity';
export {
  generalizeValue,
  generalizeObject,
  generalizeArray,
} from './anonymization/generalization';
export {
  suppressFields,
  suppressFieldsInArray,
  suppressFieldsDeep,
} from './anonymization/suppression';

// 数据最小化模块
export {
  filterFields,
  filterFieldsInArray,
  createFieldSelector,
  selectFields,
  excludeFields,
} from './minimization/filter';
export {
  cleanData,
  cleanDataArray,
  removeEmptyValues,
  removeNullish,
} from './minimization/cleaner';

// 数据去标识化模块
export {
  tokenize,
  detokenize,
  tokenizeFields,
  tokenizeFieldsInArray,
} from './pseudonymization/tokenizer';
export {
  pseudonymize,
  depseudonymize,
  pseudonymizeFields,
  pseudonymizeFieldsInArray,
  createPseudonymMapping,
} from './pseudonymization/pseudonym';

// 同意管理模块
export {
  ConsentManager,
  createConsentManager,
} from './consent/manager';
export {
  MemoryConsentStorage,
  createMemoryConsentStorage,
} from './consent/storage';

// 数据保留策略模块
export {
  isExpired,
  calculateExpirationTime,
  shouldDelete,
  isExpiringSoon,
  isPolicyApplicable,
  findApplicablePolicy,
  findExpiredItems,
  findItemsToDelete,
  findExpiringItems,
} from './retention/policy';
export {
  RetentionScheduler,
  createRetentionScheduler,
  type DataItemAccessor,
} from './retention/scheduler';

// 审计日志模块
export {
  AuditLogger,
  createAuditLogger,
} from './audit/logger';
export {
  MemoryAuditLogStorage,
  createMemoryAuditLogStorage,
} from './audit/storage';
