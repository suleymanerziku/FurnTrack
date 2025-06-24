
import { createI18nServer } from 'next-international/server';

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } = createI18nServer({
  en: () => import('./en.json'),
  am: () => import('./am.json'),
  om: () => import('./om.json'),
  ti: () => import('./ti.json'),
});
