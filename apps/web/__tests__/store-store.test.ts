import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../lib/store/storeStore';

describe('Store Store', () => {
  beforeEach(() => {
    // Reset store state before each test by directly setting the state
    useStore.setState({ count: 0 });
  });

  it('should initialize with default state', () => {
    const store = useStore.getState();
    expect(store.count).toBe(0);
  });

  it('should increment count', () => {
    const { increment } = useStore.getState();

    increment();
    const store = useStore.getState();
    expect(store.count).toBe(1);
  });

  it('should decrement count', () => {
    const { decrement } = useStore.getState();

    decrement();
    const store = useStore.getState();
    expect(store.count).toBe(-1);
  });

  it('should handle multiple increments', () => {
    const { increment } = useStore.getState();

    increment();
    increment();
    increment();
    const store = useStore.getState();
    expect(store.count).toBe(3);
  });

  it('should handle multiple decrements', () => {
    const { decrement } = useStore.getState();

    decrement();
    decrement();
    const store = useStore.getState();
    expect(store.count).toBe(-2);
  });

  it('should handle mixed increment and decrement operations', () => {
    const { increment, decrement } = useStore.getState();

    increment();
    increment();
    decrement();
    const store = useStore.getState();
    expect(store.count).toBe(1);
  });
});
