/**
 * 数据保留策略：定义和管理数据保留期限
 */

import type { RetentionPolicy, DataItemMetadata } from '../types';

/**
 * 检查数据项是否已过期
 * @param metadata 数据项元数据
 * @param policy 保留策略
 * @returns 是否已过期
 */
export function isExpired(
  metadata: DataItemMetadata,
  policy: RetentionPolicy
): boolean {
  const { retentionDays } = policy;
  const { createdAt, expiresAt } = metadata;

  // 如果已设置过期时间，直接使用
  if (expiresAt) {
    return Date.now() > expiresAt;
  }

  // 根据创建时间和保留期限计算
  const expirationTime = createdAt + retentionDays * 24 * 60 * 60 * 1000;
  return Date.now() > expirationTime;
}

/**
 * 计算数据项的过期时间
 * @param metadata 数据项元数据
 * @param policy 保留策略
 * @returns 过期时间（时间戳）
 */
export function calculateExpirationTime(
  metadata: DataItemMetadata,
  policy: RetentionPolicy
): number {
  const { retentionDays } = policy;
  const { createdAt, expiresAt } = metadata;

  // 如果已设置过期时间，直接使用
  if (expiresAt) {
    return expiresAt;
  }

  // 根据创建时间和保留期限计算
  return createdAt + retentionDays * 24 * 60 * 60 * 1000;
}

/**
 * 检查数据项是否应该被删除
 * @param metadata 数据项元数据
 * @param policy 保留策略
 * @returns 是否应该被删除
 */
export function shouldDelete(
  metadata: DataItemMetadata,
  policy: RetentionPolicy
): boolean {
  if (!policy.autoDelete) {
    return false;
  }

  return isExpired(metadata, policy);
}

/**
 * 检查数据项是否即将过期（用于通知）
 * @param metadata 数据项元数据
 * @param policy 保留策略
 * @returns 是否即将过期
 */
export function isExpiringSoon(
  metadata: DataItemMetadata,
  policy: RetentionPolicy
): boolean {
  if (!policy.notifyBeforeDays) {
    return false;
  }

  const expirationTime = calculateExpirationTime(metadata, policy);
  const notifyTime = expirationTime - policy.notifyBeforeDays * 24 * 60 * 60 * 1000;
  
  return Date.now() >= notifyTime && !isExpired(metadata, policy);
}

/**
 * 检查策略是否适用于数据项
 * @param metadata 数据项元数据
 * @param policy 保留策略
 * @returns 是否适用
 */
export function isPolicyApplicable(
  metadata: DataItemMetadata,
  policy: RetentionPolicy
): boolean {
  // 如果没有指定数据类型，策略适用于所有数据
  if (!policy.dataTypes || policy.dataTypes.length === 0) {
    return true;
  }

  // 检查数据类型是否匹配
  return policy.dataTypes.includes(metadata.type);
}

/**
 * 查找适用于数据项的保留策略
 * @param metadata 数据项元数据
 * @param policies 策略列表
 * @returns 适用的策略，如果没有则返回 null
 */
export function findApplicablePolicy(
  metadata: DataItemMetadata,
  policies: RetentionPolicy[]
): RetentionPolicy | null {
  for (const policy of policies) {
    if (isPolicyApplicable(metadata, policy)) {
      return policy;
    }
  }
  return null;
}

/**
 * 批量检查数据项是否过期
 * @param items 数据项元数据列表
 * @param policy 保留策略
 * @returns 过期项列表
 */
export function findExpiredItems(
  items: DataItemMetadata[],
  policy: RetentionPolicy
): DataItemMetadata[] {
  return items.filter(item => 
    isPolicyApplicable(item, policy) && isExpired(item, policy)
  );
}

/**
 * 批量查找应该删除的数据项
 * @param items 数据项元数据列表
 * @param policy 保留策略
 * @returns 应该删除的项列表
 */
export function findItemsToDelete(
  items: DataItemMetadata[],
  policy: RetentionPolicy
): DataItemMetadata[] {
  return items.filter(item => shouldDelete(item, policy));
}

/**
 * 批量查找即将过期的数据项
 * @param items 数据项元数据列表
 * @param policy 保留策略
 * @returns 即将过期的项列表
 */
export function findExpiringItems(
  items: DataItemMetadata[],
  policy: RetentionPolicy
): DataItemMetadata[] {
  return items.filter(item => 
    isPolicyApplicable(item, policy) && isExpiringSoon(item, policy)
  );
}
