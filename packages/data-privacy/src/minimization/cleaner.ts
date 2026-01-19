/**
 * 数据清理：移除冗余、过期或不再需要的数据
 */

import type { DataCleaningOptions } from '../types';

/**
 * 清理对象
 * @param obj 要清理的对象
 * @param options 清理选项
 * @returns 清理后的对象
 */
export function cleanData(
  obj: Record<string, unknown>,
  options: DataCleaningOptions = {}
): Record<string, unknown> {
  const {
    removeEmpty = false,
    removeNull = false,
    removeUndefined = false,
    removeDuplicates = false,
    customCleaner,
  } = options;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    // 自定义清理函数
    if (customCleaner && !customCleaner(value)) {
      continue;
    }

    // 移除空字符串
    if (removeEmpty && value === '') {
      continue;
    }

    // 移除 null
    if (removeNull && value === null) {
      continue;
    }

    // 移除 undefined
    if (removeUndefined && value === undefined) {
      continue;
    }

    // 递归清理嵌套对象
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        const cleanedArray = cleanArray(value, options);
        if (cleanedArray.length > 0 || !removeEmpty) {
          result[key] = cleanedArray;
        }
      } else {
        const cleanedObj = cleanData(value as Record<string, unknown>, options);
        if (Object.keys(cleanedObj).length > 0 || !removeEmpty) {
          result[key] = cleanedObj;
        }
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * 清理数组
 */
function cleanArray(
  arr: unknown[],
  options: DataCleaningOptions
): unknown[] {
  const {
    removeEmpty = false,
    removeNull = false,
    removeUndefined = false,
    removeDuplicates = false,
    customCleaner,
  } = options;

  let cleaned = arr.filter(item => {
    // 自定义清理函数
    if (customCleaner && !customCleaner(item)) {
      return false;
    }

    // 移除空字符串
    if (removeEmpty && item === '') {
      return false;
    }

    // 移除 null
    if (removeNull && item === null) {
      return false;
    }

    // 移除 undefined
    if (removeUndefined && item === undefined) {
      return false;
    }

    return true;
  });

  // 移除重复项
  if (removeDuplicates) {
    cleaned = removeDuplicatesFromArray(cleaned);
  }

  // 递归清理嵌套对象
  return cleaned.map(item => {
    if (item !== null && typeof item === 'object') {
      if (Array.isArray(item)) {
        return cleanArray(item, options);
      }
      return cleanData(item as Record<string, unknown>, options);
    }
    return item;
  });
}

/**
 * 从数组中移除重复项
 */
function removeDuplicatesFromArray(arr: unknown[]): unknown[] {
  const seen = new Set<string>();
  const result: unknown[] = [];

  for (const item of arr) {
    const key = JSON.stringify(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
}

/**
 * 批量清理对象数组
 * @param data 对象数组
 * @param options 清理选项
 * @returns 清理后的对象数组
 */
export function cleanDataArray(
  data: Record<string, unknown>[],
  options: DataCleaningOptions = {}
): Record<string, unknown>[] {
  return data.map(obj => cleanData(obj, options));
}

/**
 * 移除空值（null、undefined、空字符串）
 * @param obj 要清理的对象
 * @returns 清理后的对象
 */
export function removeEmptyValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return cleanData(obj, {
    removeEmpty: true,
    removeNull: true,
    removeUndefined: true,
  });
}

/**
 * 移除 null 和 undefined
 * @param obj 要清理的对象
 * @returns 清理后的对象
 */
export function removeNullish(
  obj: Record<string, unknown>
): Record<string, unknown> {
  return cleanData(obj, {
    removeNull: true,
    removeUndefined: true,
  });
}
