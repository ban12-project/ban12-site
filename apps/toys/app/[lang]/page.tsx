import type { Metadata } from 'next'

import { getDictionary, type Locale } from '#/lib/i18n'
import HomeAnimate from '#/components/home-animate'
import HomeHero from '#/components/home-hero'
import HomeIntro from '#/components/home-intro'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang)

  return {
    title: messages.home.title,
    description: messages.home.description,
    verification: {
      other: {
        'msvalidate.01': 'DA24F815AEB0CFE5CF70ECD94EC9590B',
      }
    },
  }
}

export default async function Home({ params }: Props) {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return (
    <main>
      <HomeHero messages={messages.home} />
      <HomeIntro messages={messages.home} />
      <HomeAnimate messages={messages.home} />
    </main>
  )
}
