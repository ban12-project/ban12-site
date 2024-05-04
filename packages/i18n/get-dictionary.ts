import 'server-only'

import type { Dictionaries } from './server'

export const createGetDictionary = <T>(
  dictionaries: Dictionaries<T>,
  defaultLocale: keyof Dictionaries<T>,
) => {
  return (locale: keyof Dictionaries<T>) =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- locale may be out of range
    dictionaries[locale]?.() ?? dictionaries[defaultLocale]()
}
