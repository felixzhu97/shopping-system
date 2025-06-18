import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUserStore, TOKEN_KEY, INFO_KEY, clearUserStore } from '../lib/store/userStore';

// Mock crypto utils
vi.mock('../lib/utils/crypto', () => ({
  encryptedStorage: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('User Store', () => {
  beforeEach(() => {
    // Clear store before each test
    clearUserStore();
  });

  it('should initialize with default state', () => {
    const store = useUserStore.getState();

    expect(store[TOKEN_KEY]).toBeNull();
    expect(store[INFO_KEY]).toBeNull();
    expect(store.getToken()).toBeNull();
    expect(store.getUserInfo()).toBeNull();
  });

  it('should have correct token key', () => {
    expect(TOKEN_KEY).toBe('ss-u-t');
  });

  it('should have correct info key', () => {
    expect(INFO_KEY).toBe('ss-u-i');
  });

  it('should return empty string for user ID when no user', () => {
    const store = useUserStore.getState();
    expect(store.getUserId()).toBe('');
  });

  it('should have saveToken method', () => {
    const store = useUserStore.getState();
    expect(typeof store.saveToken).toBe('function');
  });

  it('should have clearToken method', () => {
    const store = useUserStore.getState();
    expect(typeof store.clearToken).toBe('function');
  });

  it('should have saveUserInfo method', () => {
    const store = useUserStore.getState();
    expect(typeof store.saveUserInfo).toBe('function');
  });

  it('should have clearUserInfo method', () => {
    const store = useUserStore.getState();
    expect(typeof store.clearUserInfo).toBe('function');
  });

  it('should have getToken method', () => {
    const store = useUserStore.getState();
    expect(typeof store.getToken).toBe('function');
  });

  it('should have getUserInfo method', () => {
    const store = useUserStore.getState();
    expect(typeof store.getUserInfo).toBe('function');
  });
});
