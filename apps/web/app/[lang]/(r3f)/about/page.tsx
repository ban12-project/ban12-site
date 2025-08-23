import { getDictionary, type Locale } from '#/lib/i18n'
import HomeHeader from '#/components/home-header'

import R3f from './r3f'

export default async function Home(props: PageProps<'/[lang]/about'>) {
  const params = await props.params
  const messages = await getDictionary(params.lang as Locale)

  return (
    <>
      <HomeHeader />
      <main className="relative h-[calc(100dvh-calc(var(--spacing)*16))] w-screen">
        <R3f />
      </main>
    </>
  )
}
