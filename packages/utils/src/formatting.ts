import type { FormatOptions } from './types';

/**
 * 货币格式化
 * @param amount 金额
 * @param currency 货币代码（默认 'CNY'）
 * @param locale 语言环境（默认 'zh-CN'）
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(
  amount: number,
  currency: string = 'CNY',
  locale: string = 'zh-CN'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // 如果格式化失败，返回简单格式
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * 日期格式化
 * @param date 日期（Date 对象、时间戳或日期字符串）
 * @param format 格式类型（'short' | 'long' | 'medium' | 'full' | 自定义格式字符串，默认 'short'）
 * @param locale 语言环境（默认 'zh-CN'）
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number | string,
  format: 'short' | 'long' | 'medium' | 'full' | string = 'short',
  locale: string = 'zh-CN'
): string {
  let dateObj: Date;

  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  // 如果是预定义格式
  const formatMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    },
  };

  if (format in formatMap) {
    try {
      return new Intl.DateTimeFormat(locale, formatMap[format]).format(dateObj);
    } catch (error) {
      return dateObj.toLocaleDateString(locale);
    }
  }

  // 自定义格式
  try {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  } catch (error) {
    return dateObj.toLocaleDateString(locale);
  }
}

/**
 * 数字格式化
 * @param number 数字
 * @param options 格式化选项
 * @param locale 语言环境（默认 'zh-CN'）
 * @returns 格式化后的数字字符串
 */
export function formatNumber(
  number: number,
  options: FormatOptions = {},
  locale: string = 'zh-CN'
): string {
  const {
    decimals = 2,
    useGrouping = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = decimals,
  } = options;

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    }).format(number);
  } catch (error) {
    // 如果格式化失败，返回简单格式
    return number.toFixed(decimals);
  }
}

/**
 * 手机号格式化
 * @param phone 手机号
 * @param country 国家代码（'CN' 中国，'US' 美国，默认 'CN'）
 * @returns 格式化后的手机号
 */
export function formatPhoneNumber(phone: string, country: 'CN' | 'US' = 'CN'): string {
  if (!phone) {
    return '';
  }

  // 移除所有非数字字符
  const cleaned = phone.replace(/\D/g, '');

  if (country === 'CN') {
    // 中国手机号：138 0013 8000
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
    }
  }

  if (country === 'US') {
    // 美国手机号：(123) 456-7890
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }

  // 默认：返回原始值
  return phone;
}