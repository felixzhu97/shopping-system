import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock the crypto utils
vi.mock('../lib/utils/crypto', () => ({
  encryptedStorage: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Account Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', async () => {
    const { useAccountStore } = await import('../lib/store/accountStore');

    const { result } = renderHook(() => useAccountStore());

    expect(result.current.formData).toBeDefined();
    expect(result.current.formData.firstName).toBe('');
    expect(result.current.formData.lastName).toBe('');
    expect(result.current.formData.phone).toBe('');
    expect(result.current.formData.address).toBeDefined();
    expect(result.current.formData.address.country).toBe('中国');
  });

  it('should have required methods available', async () => {
    const { useAccountStore } = await import('../lib/store/accountStore');

    const { result } = renderHook(() => useAccountStore());

    expect(typeof result.current.setFormData).toBe('function');
    expect(typeof result.current.resetForm).toBe('function');
  });

  it('should set basic form data correctly', async () => {
    const { useAccountStore } = await import('../lib/store/accountStore');

    const { result } = renderHook(() => useAccountStore());

    act(() => {
      result.current.setFormData({
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      });
    });

    expect(result.current.formData.firstName).toBe('John');
    expect(result.current.formData.lastName).toBe('Doe');
    expect(result.current.formData.phone).toBe('1234567890');
  });

  it('should reset form to initial state', async () => {
    const { useAccountStore } = await import('../lib/store/accountStore');

    const { result } = renderHook(() => useAccountStore());

    // Set some data first
    act(() => {
      result.current.setFormData({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(result.current.formData.firstName).toBe('John');
    expect(result.current.formData.lastName).toBe('Doe');

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.formData.firstName).toBe('');
    expect(result.current.formData.lastName).toBe('');
    expect(result.current.formData.address.country).toBe('中国');
  });

  it('should handle partial updates', async () => {
    const { useAccountStore } = await import('../lib/store/accountStore');

    const { result } = renderHook(() => useAccountStore());

    // Set initial data
    act(() => {
      result.current.setFormData({
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      });
    });

    // Update only firstName
    act(() => {
      result.current.setFormData({
        firstName: 'Jane',
      });
    });

    expect(result.current.formData.firstName).toBe('Jane');
    expect(result.current.formData.lastName).toBe('Doe'); // Should remain unchanged
    expect(result.current.formData.phone).toBe('1234567890'); // Should remain unchanged
  });

  it('should preserve address data when updating basic fields', async () => {
    const { useAccountStore } = await import('../lib/store/accountStore');

    const { result } = renderHook(() => useAccountStore());

    // Update basic fields
    act(() => {
      result.current.setFormData({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    expect(result.current.formData.firstName).toBe('John');
    expect(result.current.formData.lastName).toBe('Doe');
    // Address should remain with default values
    expect(result.current.formData.address.country).toBe('中国');
    expect(result.current.formData.address.street).toBe('');
  });
});
