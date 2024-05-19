import { getDictionary, type Locale } from '#/i18n'

import { Header } from '#/components/ui/header'

type LayoutProps = { children: React.ReactNode; params: { lang: Locale } }

export default async function Layout({ params, children }: LayoutProps) {
  const messages = await getDictionary(params.lang)
  return (
    <>
      {<Header messages={messages} />}
      {children}
    </>
  )
}
