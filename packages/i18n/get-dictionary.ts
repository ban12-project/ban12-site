import 'server-only'

import type { Dictionaries } from './server'

export const createGetDictionary = <T>(
  dictionaries: Dictionaries<T>,
  defaultLocale: keyof T,
) => {
  return (locale?: keyof T) =>
    (locale
      ? dictionaries[locale]()
      : dictionaries[defaultLocale]()) as ReturnType<Dictionaries<T>[keyof T]>
}
