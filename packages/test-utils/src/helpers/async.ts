/**
 * 等待指定时间（用于测试异步操作）
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 刷新所有 Promise（用于等待所有异步操作完成）
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * 等待条件满足或超时
 */
export async function waitFor(
  condition: () => boolean,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`waitFor timeout after ${timeout}ms`);
    }
    await delay(interval);
  }
}

/**
 * 等待指定数量的 tick
 */
export async function waitForTicks(count: number = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await flushPromises();
  }
}

/**
 * 创建可控制的 Promise
 */
export function createControlledPromise<T = void>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
} {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}
