import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enTranslations from './lib/locales/en';
import esTranslations from './lib/locales/es';
import zhTranslations from './lib/locales/zh';
import { isDev } from './lib/utils/env';

// 翻译资源
const resources = {
  en: {
    translation: enTranslations,
  },
  zh: {
    translation: zhTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh',
    debug: isDev(),

    interpolation: {
      escapeValue: false, // React 已经默认转义了
    },

    detection: {
      order: ['localStorage', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
