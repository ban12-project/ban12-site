import { createGetDictionary } from './get-dictionary'
import { createMiddleware } from './middleware'

export type Dictionaries<T = string> = Record<string, () => T>

export interface I18nConfig {
  defaultLocale: keyof Dictionaries
  locales: Record<
    keyof Dictionaries,
    {
      lang: string
      label: string
    }
  >
}

export const createI18n = <T>(
  i18nConfig: I18nConfig,
  dictionaries: Dictionaries<T>,
) => {
  return {
    middleware: createMiddleware(i18nConfig),
    getDictionary: createGetDictionary(dictionaries, i18nConfig.defaultLocale),
  }
}
