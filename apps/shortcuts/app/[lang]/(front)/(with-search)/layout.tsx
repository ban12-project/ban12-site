import { getDictionary, type Locale } from '#/i18n'

import { Header } from '#/components/ui/header'

type LayoutProps = { children: React.ReactNode; params: Promise<{ lang: Locale }> }

export default async function Layout(props: LayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

  const messages = await getDictionary(params.lang)
  return (
    <>
      {<Header messages={messages} />}
      {children}
    </>
  )
}
