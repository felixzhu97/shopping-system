/**
 * 数据抑制：删除或隐藏敏感属性
 */

import type { SuppressionOptions } from '../types';

/**
 * 抑制对象中的字段
 * @param obj 要抑制的对象
 * @param options 抑制选项
 * @returns 抑制后的对象
 */
export function suppressFields(
  obj: Record<string, unknown>,
  options: SuppressionOptions
): Record<string, unknown> {
  const { fields, method = 'remove', maskChar = '*' } = options;
  const result: Record<string, unknown> = { ...obj };

  for (const field of fields) {
    if (field in result) {
      if (method === 'remove') {
        delete result[field];
      } else if (method === 'mask') {
        const value = result[field];
        if (typeof value === 'string') {
          result[field] = maskChar.repeat(value.length);
        } else {
          result[field] = maskChar.repeat(10);
        }
      }
    }
  }

  return result;
}

/**
 * 批量抑制对象数组中的字段
 * @param data 对象数组
 * @param options 抑制选项
 * @returns 抑制后的对象数组
 */
export function suppressFieldsInArray(
  data: Record<string, unknown>[],
  options: SuppressionOptions
): Record<string, unknown>[] {
  return data.map(obj => suppressFields(obj, options));
}

/**
 * 抑制嵌套对象中的字段
 * @param obj 要抑制的对象（可能包含嵌套）
 * @param options 抑制选项
 * @returns 抑制后的对象
 */
export function suppressFieldsDeep(
  obj: Record<string, unknown>,
  options: SuppressionOptions
): Record<string, unknown> {
  const { fields, method = 'remove', maskChar = '*' } = options;
  const result: Record<string, unknown> = { ...obj };

  function processValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map(item => 
        typeof item === 'object' && item !== null
          ? suppressFieldsDeep(item as Record<string, unknown>, options)
          : item
      );
    }
    
    if (value !== null && typeof value === 'object') {
      return suppressFieldsDeep(value as Record<string, unknown>, options);
    }
    
    return value;
  }

  for (const field of fields) {
    if (field in result) {
      if (method === 'remove') {
        delete result[field];
      } else if (method === 'mask') {
        const value = result[field];
        if (typeof value === 'string') {
          result[field] = maskChar.repeat(value.length);
        } else if (value !== null && typeof value === 'object') {
          result[field] = processValue(value);
        } else {
          result[field] = maskChar.repeat(10);
        }
      }
    }
  }

  // 处理嵌套对象
  for (const key in result) {
    if (result[key] !== null && typeof result[key] === 'object') {
      result[key] = processValue(result[key]);
    }
  }

  return result;
}
