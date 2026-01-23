/**
 * 数据泛化：将具体值替换为更通用的值
 */

import type { GeneralizationRule } from '../types';
import { GeneralizationLevel } from '../types';

/**
 * 年龄泛化函数
 */
function generalizeAge(age: number, level: GeneralizationLevel): string {
  if (level === GeneralizationLevel.FULL) {
    return 'age_group';
  }
  if (level === GeneralizationLevel.PARTIAL) {
    if (age < 18) return '0-17';
    if (age < 30) return '18-29';
    if (age < 50) return '30-49';
    if (age < 70) return '50-69';
    return '70+';
  }
  // MINIMAL
  if (age < 30) return '0-29';
  if (age < 60) return '30-59';
  return '60+';
}

/**
 * 日期泛化函数
 */
function generalizeDate(date: string | Date, level: GeneralizationLevel): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  
  if (level === GeneralizationLevel.FULL) {
    return `${year}`;
  }
  if (level === GeneralizationLevel.PARTIAL) {
    return `${year}-${month.toString().padStart(2, '0')}`;
  }
  // MINIMAL - 返回季度
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * 地区泛化函数（中国）
 */
function generalizeRegion(region: string, level: GeneralizationLevel): string {
  if (level === GeneralizationLevel.FULL) {
    return 'region';
  }
  if (level === GeneralizationLevel.PARTIAL) {
    // 保留省份
    if (region.includes('省')) {
      return region.split('省')[0] + '省';
    }
    if (region.includes('市')) {
      const parts = region.split('市');
      if (parts[0].includes('省')) {
        return parts[0].split('省')[0] + '省';
      }
      return parts[0] + '市';
    }
    return region;
  }
  // MINIMAL - 保留大区
  const provinces = [
    '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
    '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东',
    '河南', '湖北', '湖南', '广东', '广西', '海南',
    '重庆', '四川', '贵州', '云南', '西藏',
    '陕西', '甘肃', '青海', '宁夏', '新疆',
  ];
  
  for (const province of provinces) {
    if (region.includes(province)) {
      // 简单的大区划分
      if (['北京', '天津', '河北', '山西', '内蒙古'].includes(province)) {
        return '华北';
      }
      if (['辽宁', '吉林', '黑龙江'].includes(province)) {
        return '东北';
      }
      if (['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'].includes(province)) {
        return '华东';
      }
      if (['河南', '湖北', '湖南'].includes(province)) {
        return '华中';
      }
      if (['广东', '广西', '海南'].includes(province)) {
        return '华南';
      }
      if (['重庆', '四川', '贵州', '云南', '西藏'].includes(province)) {
        return '西南';
      }
      if (['陕西', '甘肃', '青海', '宁夏', '新疆'].includes(province)) {
        return '西北';
      }
    }
  }
  
  return '其他';
}

/**
 * 数值范围泛化
 */
function generalizeNumeric(
  value: number,
  level: GeneralizationLevel,
  min?: number,
  max?: number
): string {
  const range = max !== undefined && min !== undefined ? max - min : 100;
  
  if (level === GeneralizationLevel.FULL) {
    return 'numeric_range';
  }
  if (level === GeneralizationLevel.PARTIAL) {
    const step = Math.max(10, Math.floor(range / 5));
    const lower = Math.floor(value / step) * step;
    const upper = lower + step;
    return `${lower}-${upper}`;
  }
  // MINIMAL
  const step = Math.max(20, Math.floor(range / 3));
  const lower = Math.floor(value / step) * step;
  const upper = lower + step;
  return `${lower}-${upper}`;
}

/**
 * 泛化单个值
 * @param value 要泛化的值
 * @param field 字段名
 * @param level 泛化级别
 * @param customFn 自定义泛化函数
 * @returns 泛化后的值
 */
export function generalizeValue(
  value: unknown,
  field: string,
  level: GeneralizationLevel,
  customFn?: (value: unknown) => unknown
): unknown {
  // 使用自定义函数
  if (customFn) {
    return customFn(value);
  }

  // 根据字段名和类型自动泛化
  const fieldLower = field.toLowerCase();
  
  // 年龄
  if (fieldLower.includes('age') && typeof value === 'number') {
    return generalizeAge(value, level);
  }
  
  // 日期
  if ((fieldLower.includes('date') || fieldLower.includes('birth')) && (value instanceof Date || typeof value === 'string')) {
    return generalizeDate(value, level);
  }
  
  // 地区
  if ((fieldLower.includes('region') || fieldLower.includes('address') || fieldLower.includes('province') || fieldLower.includes('city')) && typeof value === 'string') {
    return generalizeRegion(value, level);
  }
  
  // 数值
  if (typeof value === 'number') {
    return generalizeNumeric(value, level);
  }
  
  // 默认返回原值
  return value;
}

/**
 * 泛化对象
 * @param obj 要泛化的对象
 * @param rules 泛化规则列表
 * @returns 泛化后的对象
 */
export function generalizeObject(
  obj: Record<string, unknown>,
  rules: GeneralizationRule[]
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...obj };
  
  for (const rule of rules) {
    if (rule.field in result) {
      const value = result[rule.field];
      result[rule.field] = generalizeValue(
        value,
        rule.field,
        rule.level,
        rule.customFn
      );
    }
  }
  
  return result;
}

/**
 * 批量泛化对象数组
 * @param data 对象数组
 * @param rules 泛化规则列表
 * @returns 泛化后的对象数组
 */
export function generalizeArray(
  data: Record<string, unknown>[],
  rules: GeneralizationRule[]
): Record<string, unknown>[] {
  return data.map(obj => generalizeObject(obj, rules));
}
