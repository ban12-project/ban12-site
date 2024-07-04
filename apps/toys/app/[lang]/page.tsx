import type { Metadata } from 'next'
import { getDictionary, type Locale } from '#/i18n'

type Props = {
  params: { lang: Locale }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getDictionary(params.lang)

  return {
    title: messages.home.title,
    description: messages.home.description,
  }
}

export default function Home() {
  return <h1>home</h1>
}
