import 'server-only'

import type { Dictionaries } from './server'

export const createGetDictionary = <T>(
  dictionaries: Dictionaries<T>,
  defaultLocale: keyof Dictionaries<T>,
) => {
  return (locale: keyof Dictionaries<T>) =>
    dictionaries[locale]?.() ?? dictionaries[defaultLocale]()
}
