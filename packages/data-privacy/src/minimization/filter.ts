/**
 * 字段过滤：根据业务需求过滤不需要的数据字段
 */

import type { FieldFilterOptions } from '../types';

/**
 * 过滤对象字段
 * @param obj 要过滤的对象
 * @param options 过滤选项
 * @returns 过滤后的对象
 */
export function filterFields(
  obj: Record<string, unknown>,
  options: FieldFilterOptions
): Record<string, unknown> {
  const { include, exclude, deep = false } = options;
  const result: Record<string, unknown> = {};

  // 如果指定了 include，只保留这些字段
  if (include && include.length > 0) {
    for (const field of include) {
      if (field in obj) {
        result[field] = deep
          ? filterNestedValue(obj[field])
          : obj[field];
      }
    }
    return result;
  }

  // 如果指定了 exclude，排除这些字段
  if (exclude && exclude.length > 0) {
    const excludeSet = new Set(exclude);
    for (const [key, value] of Object.entries(obj)) {
      if (!excludeSet.has(key)) {
        result[key] = deep ? filterNestedValue(value) : value;
      }
    }
    return result;
  }

  // 如果没有指定选项，返回原对象
  return obj;
}

/**
 * 递归过滤嵌套值
 */
function filterNestedValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(item => filterNestedValue(item));
  }
  
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = filterNestedValue(val);
    }
    return result;
  }
  
  return value;
}

/**
 * 批量过滤对象数组
 * @param data 对象数组
 * @param options 过滤选项
 * @returns 过滤后的对象数组
 */
export function filterFieldsInArray(
  data: Record<string, unknown>[],
  options: FieldFilterOptions
): Record<string, unknown>[] {
  return data.map(obj => filterFields(obj, options));
}

/**
 * 创建字段选择器函数
 * @param options 过滤选项
 * @returns 字段选择器函数
 */
export function createFieldSelector(
  options: FieldFilterOptions
): (obj: Record<string, unknown>) => Record<string, unknown> {
  return (obj: Record<string, unknown>) => filterFields(obj, options);
}

/**
 * 选择多个字段
 * @param obj 源对象
 * @param fields 要选择的字段列表
 * @returns 只包含指定字段的对象
 */
export function selectFields(
  obj: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> {
  return filterFields(obj, { include: fields });
}

/**
 * 排除多个字段
 * @param obj 源对象
 * @param fields 要排除的字段列表
 * @returns 排除指定字段后的对象
 */
export function excludeFields(
  obj: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> {
  return filterFields(obj, { exclude: fields });
}
