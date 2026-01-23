import { vi } from 'vitest';
import { setupBrowserMocks } from '../mocks/browser';

/**
 * Web 应用的通用 Vitest 设置
 * 包括常见的 Mock 和配置
 */
export function setupWebTests() {
  // 设置浏览器 API Mock
  setupBrowserMocks();

  // Mock next/router (如果需要)
  vi.mock('next/router', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }),
  }));

  // Mock next/navigation (如果需要)
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));

  // Mock react-i18next (如果需要)
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        changeLanguage: vi.fn(),
        language: 'zh',
      },
    }),
    Trans: ({ children }: { children: any }) => children,
    initReactI18next: {
      type: '3rdParty',
      init: vi.fn(),
    },
  }));
}

/**
 * 清除所有 Web 测试 Mock
 */
export function teardownWebTests() {
  vi.clearAllMocks();
}
