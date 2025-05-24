import { createI18n } from '@repo/i18n/server'

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
  },
} as const

export type Locale = keyof (typeof i18n)['locales']

export type Messages = Awaited<ReturnType<typeof getDictionary>>

export const { middleware, getDictionary } = createI18n(i18n, {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  'zh-CN': () =>
    import('../dictionaries/zh-CN.json').then((module) => module.default),
})
