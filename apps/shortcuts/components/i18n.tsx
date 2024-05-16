'use client'

import { createContext, useContext } from 'react'
import { i18n, type Locale } from '#/i18n-config'

type LocaleContextValue = {
  i18n: typeof i18n
  locale: Locale
}

const LocaleContext = createContext<LocaleContextValue>(
  {} as LocaleContextValue,
)
const LocaleProvider: React.FC<{
  locale: Locale
  children: React.ReactNode
}> = ({ locale, children }) => (
  <LocaleContext.Provider value={{ i18n, locale }}>
    {children}
  </LocaleContext.Provider>
)

const useLocale = () => useContext(LocaleContext)

export { LocaleProvider, useLocale }
