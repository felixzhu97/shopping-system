import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { vi } from 'vitest';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  /**
   * 初始状态（如果使用状态管理）
   */
  initialState?: Record<string, any>;
  /**
   * 自定义 Provider 组件
   */
  providers?: Array<(props: { children: ReactNode }) => ReactElement>;
}

/**
 * 自定义渲染器，自动包含常用的 Provider
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult {
  const { initialState, providers = [], ...renderOptions } = options;

  // 构建 Provider 链
  let wrappedUi = ui;
  providers.forEach((Provider) => {
    wrappedUi = <Provider>{wrappedUi}</Provider>;
  });

  // 如果有初始状态，可以在这里添加状态管理 Provider
  // 例如: if (initialState) { wrappedUi = <StoreProvider initialState={initialState}>{wrappedUi}</StoreProvider>; }

  return render(wrappedUi, renderOptions);
}

/**
 * 创建自定义渲染器（带默认 Provider）
 */
export function createRender(
  defaultOptions?: RenderWithProvidersOptions
) {
  return (ui: ReactElement, options?: RenderWithProvidersOptions) => {
    return renderWithProviders(ui, { ...defaultOptions, ...options });
  };
}

/**
 * 创建包装组件（用于多次使用相同的 Provider）
 */
export function createWrapper(providers: Array<(props: { children: ReactNode }) => ReactElement>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    let wrapped = children as ReactElement;
    providers.forEach((Provider) => {
      wrapped = <Provider>{wrapped}</Provider>;
    });
    return wrapped;
  };
}
