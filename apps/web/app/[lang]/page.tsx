import { getDictionary, type Locale } from '#/lib/i18n'
import HomeLanding from '#/components/home-landing'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
}>

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return <HomeLanding messages={messages} />
}
