import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import detector from 'i18next-browser-languagedetector';

import en from './locales/en/defaults.json';

export const LANGUAGE_RESOURCES = {
  en: {
    translation: en,
  },
};

i18n
  .use(detector)
  .use(initReactI18next)
  .init({
    resources: LANGUAGE_RESOURCES,
    fallbackLng: { default: ['en'] },
    nsSeparator: false,
    detection: {
      order: ['localStorage', 'navigator', 'querystring', 'cookie', 'htmlTag'],
      lookupQuerystring: 'lang',
      lookupCookie: 'i18n',
      lookupLocalStorage: 'i18App',
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;

(window as any).i18n = i18n;
