import type { Metadata } from 'next'

import { getDictionary, type Locale } from '#/lib/i18n'
import HomeAnimate from '#/components/home-animate'
import HomeHero from '#/components/home-hero'
import HomeIntro from '#/components/home-intro'

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang as Locale)

  return {
    title: messages.home.title,
    description: messages.home.description,
  }
}

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params
  const messages = await getDictionary(lang as Locale)

  return (
    <main>
      <HomeHero messages={messages.home} />
      <HomeIntro messages={messages.home} />
      <HomeAnimate messages={messages.home} />
    </main>
  )
}
