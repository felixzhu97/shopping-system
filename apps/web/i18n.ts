import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './lib/locales/en';
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
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
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
