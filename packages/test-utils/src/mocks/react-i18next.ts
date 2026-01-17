import { vi } from 'vitest';
import { ReactNode } from 'react';

export interface I18nextMockOptions {
  t?: (key: string) => string;
  language?: string;
  changeLanguage?: ReturnType<typeof vi.fn>;
  defaultNS?: string;
  i18n?: any;
}

/**
 * Mock React i18next
 */
export function mockI18next(options: I18nextMockOptions = {}) {
  const {
    t = (key: string) => key,
    language = 'zh',
    changeLanguage = vi.fn(),
    defaultNS = 'translation',
    i18n = {},
  } = options;

  const mockI18nInstance = {
    language,
    languages: [language, 'en'],
    changeLanguage,
    t,
    exists: vi.fn((key: string) => true),
    getFixedT: vi.fn(() => t),
    hasResourceBundle: vi.fn(() => true),
    loadNamespaces: vi.fn(),
    loadLanguages: vi.fn(),
    reloadResources: vi.fn(),
    use: vi.fn(),
    isInitialized: true,
    options: {
      defaultNS,
      ns: [defaultNS],
    },
    ...i18n,
  };

  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t,
      i18n: mockI18nInstance,
      ready: true,
    }),
    Trans: ({ children }: { children: ReactNode }) => children,
    initReactI18next: {
      type: '3rdParty' as const,
      init: vi.fn(),
    },
    I18nextProvider: ({ children }: { children: ReactNode }) => children,
    withTranslation: (component: any) => component,
    useTranslation: vi.fn(() => ({
      t,
      i18n: mockI18nInstance,
      ready: true,
    })),
  }));

  return { t, i18n: mockI18nInstance, changeLanguage };
}
