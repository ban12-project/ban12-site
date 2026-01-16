import { createI18n } from '@repo/i18n/server';

export const i18n = {
  defaultLocale: 'en',
  locales: {
    en: {
      lang: 'en',
      label: 'English',
    },
    'zh-CN': {
      lang: 'zh-CN',
      label: '简体中文',
    },
    ja: {
      lang: 'ja',
      label: '日本語',
    },
    sv: {
      lang: 'sv',
      label: 'Svenska',
    },
    ar: {
      lang: 'ar',
      label: 'العربية',
    },
  },
} as const;

export type Locale = keyof (typeof i18n)['locales'];
export type Messages = Awaited<ReturnType<typeof getDictionary>>;

export const { middleware, getDictionary } = createI18n(i18n, {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  'zh-CN': () =>
    import('../dictionaries/zh-CN.json').then((module) => module.default),
  ja: () => import('../dictionaries/ja.json').then((module) => module.default),
  sv: () => import('../dictionaries/sv.json').then((module) => module.default),
  ar: () => import('../dictionaries/ar.json').then((module) => module.default),
});
