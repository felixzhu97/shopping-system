import { expect } from 'vitest';

/**
 * 断言对象包含所有指定的属性
 */
export function expectToHaveProperties<T extends object>(
  obj: T,
  properties: (keyof T)[]
): void {
  properties.forEach((prop) => {
    expect(obj).toHaveProperty(prop as string);
  });
}

/**
 * 断言对象是有效的日期
 */
export function expectValidDate(date: Date | string | number): void {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  expect(dateObj.getTime()).not.toBeNaN();
  expect(dateObj.getTime()).toBeGreaterThan(0);
}

/**
 * 断言对象是有效的邮箱
 */
export function expectValidEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  expect(email).toMatch(emailRegex);
}

/**
 * 断言对象是有效的手机号（中国）
 */
export function expectValidPhone(phone: string): void {
  const phoneRegex = /^1[3-9]\d{9}$/;
  expect(phone).toMatch(phoneRegex);
}

/**
 * 断言对象是有效的 URL
 */
export function expectValidUrl(url: string): void {
  try {
    new URL(url);
    expect(true).toBe(true);
  } catch {
    expect.fail(`Expected ${url} to be a valid URL`);
  }
}

/**
 * 断言数字在指定范围内
 */
export function expectInRange(value: number, min: number, max: number): void {
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

/**
 * 断言对象近似等于（用于浮点数比较）
 */
export function expectApproximatelyEqual(
  actual: number,
  expected: number,
  tolerance: number = 0.01
): void {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}
