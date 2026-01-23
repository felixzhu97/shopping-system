import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import type { ByRoleMatcher, ByRoleOptions } from '@testing-library/react';

/**
 * 查询元素（带重试）
 */
export async function queryElement(
  matcher: ByRoleMatcher,
  options?: ByRoleOptions,
  timeout?: number
) {
  return await waitFor(() => screen.queryByRole(matcher, options), { timeout });
}

/**
 * 获取元素（带重试）
 */
export async function getElement(
  matcher: ByRoleMatcher,
  options?: ByRoleOptions,
  timeout?: number
) {
  return await waitFor(() => screen.getByRole(matcher, options), { timeout });
}

/**
 * 查找元素（带重试）
 */
export async function findElement(
  matcher: ByRoleMatcher,
  options?: ByRoleOptions,
  timeout?: number
) {
  return await waitFor(() => screen.findByRole(matcher, options), { timeout });
}

/**
 * 等待元素消失
 */
export async function waitForElementRemoval(
  element: HTMLElement,
  timeout?: number
) {
  return await waitForElementToBeRemoved(() => element, { timeout });
}

/**
 * 在容器内查询元素
 */
export function queryWithin(
  container: HTMLElement,
  matcher: ByRoleMatcher,
  options?: ByRoleOptions
) {
  return within(container).queryByRole(matcher, options);
}

/**
 * 在容器内获取元素
 */
export function getWithin(
  container: HTMLElement,
  matcher: ByRoleMatcher,
  options?: ByRoleOptions
) {
  return within(container).getByRole(matcher, options);
}

/**
 * 查询所有元素（带重试）
 */
export async function queryAllElements(
  matcher: ByRoleMatcher,
  options?: ByRoleOptions,
  timeout?: number
) {
  return await waitFor(() => screen.queryAllByRole(matcher, options), { timeout });
}
