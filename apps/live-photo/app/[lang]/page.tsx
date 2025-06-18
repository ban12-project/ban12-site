import { getDictionary, Locale } from '#/lib/i18n'
import Form from '#/components/form'
import LivePhotoClientOnly from '#/components/live-photo-client-only'
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
      <LivePhotoClientOnly
        messages={messages}
        className="aspect-[3/4] max-w-[540px]"
        playerProps={{
          photoSrc:
            'https://assets.ban12.com/18bba191-e1e5-4a81-84bf-d464840e2d52.jpeg',
          videoSrc:
            'https://assets.ban12.com/18bba191-e1e5-4a81-84bf-d464840e2d52.mov',
        }}
      />
      <Form />
    </>
  )
}
