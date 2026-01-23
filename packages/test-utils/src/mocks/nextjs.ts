import { vi } from 'vitest';

export interface NextRouterMockOptions {
  push?: ReturnType<typeof vi.fn>;
  replace?: ReturnType<typeof vi.fn>;
  back?: ReturnType<typeof vi.fn>;
  prefetch?: ReturnType<typeof vi.fn>;
  pathname?: string;
  query?: Record<string, string | string[]>;
  asPath?: string;
  route?: string;
  basePath?: string;
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
}

export interface NextNavigationMockOptions {
  push?: ReturnType<typeof vi.fn>;
  replace?: ReturnType<typeof vi.fn>;
  back?: ReturnType<typeof vi.fn>;
  prefetch?: ReturnType<typeof vi.fn>;
  refresh?: ReturnType<typeof vi.fn>;
  pathname?: string;
  searchParams?: URLSearchParams | (() => URLSearchParams);
}

/**
 * Mock Next.js Router (next/router)
 */
export function mockNextRouter(options: NextRouterMockOptions = {}) {
  const {
    push = vi.fn(),
    replace = vi.fn(),
    back = vi.fn(),
    prefetch = vi.fn(),
    pathname = '/',
    query = {},
    asPath = '/',
    route = '/',
    basePath = '',
    locale = 'zh',
    locales = ['zh', 'en'],
    defaultLocale = 'zh',
  } = options;

  vi.mock('next/router', () => ({
    useRouter: () => ({
      push,
      replace,
      back,
      prefetch,
      pathname,
      query,
      asPath,
      route,
      basePath,
      locale,
      locales,
      defaultLocale,
      isReady: true,
      isPreview: false,
      isLocaleDomain: true,
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }),
  }));

  return { push, replace, back, prefetch };
}

/**
 * Mock Next.js Navigation (next/navigation)
 */
export function mockNextNavigation(options: NextNavigationMockOptions = {}) {
  const {
    push = vi.fn(),
    replace = vi.fn(),
    back = vi.fn(),
    prefetch = vi.fn(),
    refresh = vi.fn(),
    pathname = '/',
    searchParams = new URLSearchParams(),
  } = options;

  const getSearchParams =
    typeof searchParams === 'function' ? searchParams : () => searchParams;

  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push,
      replace,
      back,
      prefetch,
      refresh,
    }),
    usePathname: () => pathname,
    useSearchParams: getSearchParams,
    useParams: () => ({}),
    notFound: vi.fn(),
    redirect: vi.fn(),
  }));

  return { push, replace, back, prefetch, refresh };
}
