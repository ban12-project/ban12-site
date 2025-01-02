import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getDictionary, type Locale } from '#/i18n'

type Props = {
  params: Promise<{ lang: Locale }>
}

export const runtime = 'edge'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang)

  return {
    title: messages.home.title,
    description: messages.home.description,
  }
}

export default function Home() {
  redirect('/7-zip')

  return <h1>home</h1>
}
