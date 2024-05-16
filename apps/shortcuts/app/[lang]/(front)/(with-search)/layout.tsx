import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

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
