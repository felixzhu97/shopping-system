import { vi } from 'vitest';

export interface ZustandStoreMockOptions<T> {
  initialState?: T;
  actions?: Record<string, ReturnType<typeof vi.fn>>;
}

/**
 * Mock Zustand Store Hook
 * 用于在测试中 Mock Zustand store
 */
export function mockZustandStore<T>(
  storeName: string,
  options: ZustandStoreMockOptions<T> = {}
): ReturnType<typeof vi.fn> {
  const { initialState = {} as T, actions = {} } = options;

  const mockStore = vi.fn(() => ({
    ...initialState,
    ...actions,
  }));

  vi.mock(storeName, () => ({
    [storeName]: mockStore,
    default: mockStore,
  }));

  return mockStore;
}

/**
 * 创建 Zustand Store Mock Hook
 * 用于替换特定的 store hook
 */
export function createMockStoreHook<T>(
  initialState: T = {} as T,
  actions: Record<string, ReturnType<typeof vi.fn>> = {}
) {
  return vi.fn(() => ({
    ...initialState,
    ...actions,
  }));
}
