import { createGetDictionary } from './get-dictionary'
import { createMiddleware } from './middleware'

export type Dictionaries<U> =
  U extends Record<keyof U, () => unknown> ? U : never

type Locales = Record<string, { [key: string]: string }>

export interface I18nConfig<T = Locales> {
  defaultLocale: T extends Locales ? keyof T : never
  locales: T
}

export const createI18n = <
  T extends Locales,
  U extends Record<keyof T, unknown>,
>(
  i18nConfig: T extends Locales ? I18nConfig<T> : never,
  dictionaries: Dictionaries<U>,
) => {
  return {
    middleware: createMiddleware(i18nConfig),
    getDictionary: createGetDictionary(dictionaries, i18nConfig.defaultLocale),
  }
}
