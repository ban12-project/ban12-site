'use client'

import { createContext, useContext } from 'react'

interface LocaleContextValue<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  i18n: T
  locale: keyof T
}

const LocaleContext = createContext<LocaleContextValue>(
  {} as LocaleContextValue,
)
function LocaleProvider({
  i18n,
  locale,
  children,
}: LocaleContextValue & {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <LocaleContext.Provider value={{ i18n, locale }}>
      {children}
    </LocaleContext.Provider>
  )
}

const useLocale = (): LocaleContextValue => useContext(LocaleContext)

export { LocaleProvider, useLocale }
