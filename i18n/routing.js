import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ta', 'hi', 'es', 'de', 'ur', 'ja', 'fr', 'zh', 'ko', 'pt', 'it'],
  defaultLocale: 'en'
});
