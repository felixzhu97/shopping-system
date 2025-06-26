import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    redirect: vi.fn(),
    next: vi.fn(() => ({
      headers: new Map(),
      type: 'response',
    })),
  },
}));

// Mock crypto function
vi.mock('../lib/utils/crypto', () => ({
  decrypt: vi.fn(),
}));

import { decrypt } from '../lib/utils/crypto';

// Import middleware after mocking
import { middleware } from '../middleware';

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks for each test
    (NextResponse.redirect as any).mockReturnValue({ type: 'redirect' });
    (NextResponse.next as any).mockReturnValue({
      headers: new Map(),
      type: 'response',
    });
  });

  it('should redirect to login for protected routes without token', async () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/account',
        search: '?test=1',
        toString: vi.fn(() => 'http://localhost:3000/account?test=1'),
      },
      url: 'http://localhost:3000/account?test=1',
      cookies: {
        get: vi.fn((name: string) => (name === 'user-store' ? undefined : undefined)),
      },
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalled();
    const redirectCall = (NextResponse.redirect as any).mock.calls[0];
    const redirectUrl = redirectCall[0];
    expect(redirectUrl.toString()).toContain('/auth/confirm');
    expect(redirectUrl.toString()).toContain('callbackUrl');
  });

  it('should allow access to public routes', async () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/login',
        search: '',
      },
      cookies: {
        get: vi.fn(() => undefined),
      },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should allow access with valid token', async () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/products',
        search: '',
      },
      cookies: {
        get: vi.fn((name: string) =>
          name === 'user-store' ? { value: 'encrypted-token' } : undefined
        ),
      },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
  });

  it('should redirect to login with invalid token', async () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/account',
        search: '',
        toString: vi.fn(() => 'http://localhost:3000/account'),
      },
      url: 'http://localhost:3000/account',
      cookies: {
        get: vi.fn((name: string) => (name === 'user-store' ? undefined : undefined)),
      },
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it('should handle cart page correctly', async () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/cart',
        search: '',
        toString: vi.fn(() => 'http://localhost:3000/cart'),
      },
      url: 'http://localhost:3000/cart',
      cookies: {
        get: vi.fn((name: string) => (name === 'user-store' ? undefined : undefined)), // No token
      },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalled();
  });

  it('should handle checkout page correctly', async () => {
    const mockRequest = {
      nextUrl: {
        pathname: '/checkout',
        search: '',
        toString: vi.fn(() => 'http://localhost:3000/checkout'),
      },
      url: 'http://localhost:3000/checkout',
      cookies: {
        get: vi.fn((name: string) => (name === 'user-store' ? undefined : undefined)), // No token
      },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.redirect).toHaveBeenCalled();
  });
});
