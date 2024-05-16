import Welcome from '@/components/Welcome'
import { getDictionary, Locale } from '@/i18n'

type Props = { params: { lang: Locale } }

export default async function Home({ params }: Props) {
  const messages = await getDictionary(params.lang)

  return <Welcome messages={messages} />
}
