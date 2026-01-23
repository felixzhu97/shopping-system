import { ReactElement, ReactNode } from 'react';
import { renderHook, RenderHookOptions, RenderHookResult } from '@testing-library/react';
import { renderWithProviders, RenderWithProvidersOptions } from './render';

export interface RenderHookWithProvidersOptions<TProps>
  extends Omit<RenderHookOptions<TProps>, 'wrapper'> {
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
 * 渲染 Hook（带 Provider）
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: RenderHookWithProvidersOptions<TProps> = {}
): RenderHookResult<TResult, TProps> {
  const { initialState, providers = [], ...hookOptions } = options;

  // 如果有 Provider，创建 wrapper
  let wrapper: ((props: { children: ReactNode }) => ReactElement) | undefined;
  if (providers.length > 0) {
    wrapper = ({ children }: { children: ReactNode }) => {
      let wrapped = children as ReactElement;
      providers.forEach(Provider => {
        wrapped = <Provider>{wrapped}</Provider>;
      });
      return wrapped;
    };
  }

  return renderHook(hook, {
    ...hookOptions,
    wrapper,
  });
}

/**
 * 创建 Hook 渲染器（带默认 Provider）
 */
export function createHookRenderer(defaultOptions?: RenderHookWithProvidersOptions<any>) {
  return <TProps, TResult>(
    hook: (props: TProps) => TResult,
    options?: RenderHookWithProvidersOptions<TProps>
  ) => {
    return renderHookWithProviders(hook, { ...defaultOptions, ...options });
  };
}
