'use client';

import { createContext, useContext } from 'react';

import type { I18nConfig } from './server';

interface LocaleContextValue<T extends I18nConfig = I18nConfig> {
  i18n: T;
  locale: keyof T['locales'] extends string ? keyof T['locales'] : never;
}

const LocaleContext = createContext<LocaleContextValue>(
  {} as LocaleContextValue,
);
function LocaleProvider<T extends I18nConfig>({
  i18n,
  locale,
  children,
}: LocaleContextValue<T> & {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <LocaleContext.Provider value={{ i18n, locale }}>
      {children}
    </LocaleContext.Provider>
  );
}

const useLocale = () => useContext(LocaleContext);

export { LocaleProvider, useLocale };
