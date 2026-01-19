/**
 * k-匿名化：确保每条记录至少与 k-1 条其他记录无法区分
 */

import { generalizeArray } from './generalization';
import type { GeneralizationRule, KAnonymityOptions } from '../types';

/**
 * 计算准标识符的组合值（用于分组）
 */
function getQuasiIdentifierKey(
  record: Record<string, unknown>,
  quasiIdentifiers: string[]
): string {
  return quasiIdentifiers
    .map(field => {
      const value = record[field];
      return value !== null && value !== undefined ? String(value) : '';
    })
    .join('|');
}

/**
 * 实现 k-匿名化
 * @param data 要匿名化的数据
 * @param options k-匿名化选项
 * @returns k-匿名化后的数据
 */
export function kAnonymize(
  data: Record<string, unknown>[],
  options: KAnonymityOptions
): Record<string, unknown>[] {
  const { k, quasiIdentifiers, sensitiveFields = [], generalizationRules = [] } = options;

  if (data.length < k) {
    throw new Error(`数据量不足：需要至少 ${k} 条记录，当前只有 ${data.length} 条`);
  }

  // 按准标识符分组
  const groups = new Map<string, Record<string, unknown>[]>();
  
  for (const record of data) {
    const key = getQuasiIdentifierKey(record, quasiIdentifiers);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  }

  // 检查每个组的大小
  const validGroups: Record<string, unknown>[][] = [];
  const invalidGroups: Record<string, unknown>[][] = [];

  for (const group of groups.values()) {
    if (group.length >= k) {
      validGroups.push(group);
    } else {
      invalidGroups.push(group);
    }
  }

  // 如果所有组都满足 k-匿名要求，直接返回
  if (invalidGroups.length === 0) {
    return data;
  }

  // 对不满足要求的组进行泛化
  let result: Record<string, unknown>[] = [...validGroups.flat()];
  let remaining = invalidGroups.flat();
  let iteration = 0;
  const maxIterations = 10; // 防止无限循环

  while (remaining.length > 0 && iteration < maxIterations) {
    iteration++;
    
    // 应用泛化规则
    if (generalizationRules.length > 0) {
      remaining = generalizeArray(remaining, generalizationRules);
    } else {
      // 如果没有提供泛化规则，尝试自动泛化
      // 这里简化处理：对所有准标识符字段进行部分泛化
      for (const field of quasiIdentifiers) {
        const rule: GeneralizationRule = {
          field,
          level: 'partial',
        };
        remaining = generalizeArray(remaining, [rule]);
      }
    }

    // 重新分组
    const newGroups = new Map<string, Record<string, unknown>[]>();
    for (const record of remaining) {
      const key = getQuasiIdentifierKey(record, quasiIdentifiers);
      if (!newGroups.has(key)) {
        newGroups.set(key, []);
      }
      newGroups.get(key)!.push(record);
    }

    // 分离满足和不满足的组
    const newValid: Record<string, unknown>[][] = [];
    const newInvalid: Record<string, unknown>[][] = [];

    for (const group of newGroups.values()) {
      if (group.length >= k) {
        newValid.push(group);
      } else {
        newInvalid.push(group);
      }
    }

    result = [...result, ...newValid.flat()];
    remaining = newInvalid.flat();

    // 如果剩余数据无法满足 k-匿名要求，可能需要抑制
    if (remaining.length > 0 && remaining.length < k) {
      // 抑制这些记录（在实际应用中，可能需要更复杂的处理）
      // 这里简单地将它们从结果中移除
      break;
    }
  }

  return result;
}

/**
 * 检查数据是否满足 k-匿名要求
 * @param data 要检查的数据
 * @param k k 值
 * @param quasiIdentifiers 准标识符字段列表
 * @returns 是否满足 k-匿名要求
 */
export function checkKAnonymity(
  data: Record<string, unknown>[],
  k: number,
  quasiIdentifiers: string[]
): boolean {
  if (data.length < k) {
    return false;
  }

  const groups = new Map<string, number>();
  
  for (const record of data) {
    const key = getQuasiIdentifierKey(record, quasiIdentifiers);
    groups.set(key, (groups.get(key) || 0) + 1);
  }

  // 检查所有组的大小是否都 >= k
  for (const count of groups.values()) {
    if (count < k) {
      return false;
    }
  }

  return true;
}

/**
 * 计算 k-匿名化的统计信息
 * @param data 数据
 * @param k k 值
 * @param quasiIdentifiers 准标识符字段列表
 * @returns 统计信息
 */
export function getKAnonymityStats(
  data: Record<string, unknown>[],
  k: number,
  quasiIdentifiers: string[]
): {
  totalRecords: number;
  groupCount: number;
  minGroupSize: number;
  maxGroupSize: number;
  satisfiesKAnonymity: boolean;
} {
  const groups = new Map<string, number>();
  
  for (const record of data) {
    const key = getQuasiIdentifierKey(record, quasiIdentifiers);
    groups.set(key, (groups.get(key) || 0) + 1);
  }

  const groupSizes = Array.from(groups.values());
  const minGroupSize = groupSizes.length > 0 ? Math.min(...groupSizes) : 0;
  const maxGroupSize = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;

  return {
    totalRecords: data.length,
    groupCount: groups.size,
    minGroupSize,
    maxGroupSize,
    satisfiesKAnonymity: minGroupSize >= k,
  };
}
