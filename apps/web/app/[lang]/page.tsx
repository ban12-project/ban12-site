import { getDictionary, type Locale } from '#/lib/i18n'
import HomeHeader from '#/components/home-header'
import HomeLanding from '#/components/home-landing'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
}>

export default async function HomePage({ params }: Props) {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return (
    <>
      <HomeHeader />
      <main className="h-[calc(100dvh-calc(var(--spacing)*16))] w-screen">
        <HomeLanding messages={messages} />
      </main>
    </>
  )
}
