import { getDictionary, type Locale } from '#/lib/i18n'
import { Header } from '#/components/header'

export default async function Layout(props: Omit<LayoutProps<'/[lang]'>, 'get' | 'post'>) {
  const params = await props.params
  const { children } = props

  const messages = await getDictionary(params.lang as Locale)

  return (
    <>
      <Header messages={messages} />
      {children}
    </>
  )
}
