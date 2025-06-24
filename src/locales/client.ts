
'use client';
import { createI18nClient } from 'next-international/client';

export const {
  useI18n,
  useScopedI18n,
  I18nProviderClient,
  useChangeLocale,
  useCurrentLocale,
} = createI18nClient({
  en: () => import('./en.json'),
  am: () => import('./am.json'),
  om: () => import('./om.json'),
  ti: () => import('./ti.json'),
});
