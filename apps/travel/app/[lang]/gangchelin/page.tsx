import { Suspense, unstable_ViewTransition as ViewTransition } from 'react'
import { Link } from '@repo/i18n/client'

import { getRestaurants } from '#/lib/db/queries'
import { getDictionary, type Locale } from '#/lib/i18n'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
}>

export default async function GANGCHELIN({ params }: Props) {
  const { lang } = await params
  const message = await getDictionary(lang)

  return (
    <main>
      <div className="text-center">
        <ViewTransition name="link-gangchelin">
          <h1 className="inline-block text-center">GANGCHELIN</h1>
        </ViewTransition>
      </div>
      <Link href="/">Home</Link>
      <Suspense fallback={<div>Loading...</div>}>
        <Restaurants />
      </Suspense>
    </main>
  )
}

async function Restaurants() {
  const restaurants = await getRestaurants()

  return (
    <div className="grid grid-cols-3 gap-4">
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.bvid}
          className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800"
        >
          <h2 className="text-xl font-bold dark:text-white">
            {restaurant.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {restaurant.description}
          </p>
        </div>
      ))}
    </div>
  )
}
