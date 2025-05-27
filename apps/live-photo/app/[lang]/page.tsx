import { unstable_ViewTransition as ViewTransition } from 'react'
import { Link } from '@repo/i18n/client'

import { getDictionary, Locale } from '#/lib/i18n'
import LivePhoto from '#/components/live-photo'
import { Search } from '#/components/search'

type HomePageProps = {
  params: Promise<{ lang: Locale }>
}

export default async function Home(props: HomePageProps) {
  const params = await props.params
  const messages = await getDictionary(params.lang)

  return (
    <>
      <Search />
      <LivePhoto
        messages={messages}
        className="aspect-[3/4] max-w-[540px]"
        playerProps={{
          photoSrc:
            'https://assets.ban12.com/18bba191-e1e5-4a81-84bf-d464840e2d52.jpeg',
          videoSrc:
            'https://assets.ban12.com/18bba191-e1e5-4a81-84bf-d464840e2d52.mov',
        }}
      />
    </>
  )
}
