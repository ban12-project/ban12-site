import { Suspense, ViewTransition } from 'react'
import { notFound } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'

import { getDictionary, type Locale } from '#/lib/i18n'

import RestaurantDetail from '../../[restaurantName]/restaurant-detail'
import { getCachedRestaurantWithPostsByName } from '../../actions'
import Drawer from './drawer'
import { getRestaurants } from '#/lib/db/queries'

export async function generateStaticParams() {
  const restaurants = await getRestaurants()
  return restaurants.map((restaurant) => ({
    restaurantName: restaurant.ai_summarize?.restaurantName,
  }))
}

export default function Page({
  params,
}: PageProps<'/[lang]/follow-up/[restaurantName]'>) {
  return (
    <Drawer>
      <Suspense
        fallback={
          <ViewTransition exit="mapbox-fallback-exit">
            <div className="slide-in-from-bottom-10 fade-in fill-mode-forwards animate-in flex h-full items-center justify-center ease-[cubic-bezier(0.7,0,0.3,1)]">
              <LoaderCircle className="animate-spin" />
            </div>
          </ViewTransition>
        }
      >
        <ViewTransition enter="mapbox-enter">
          <Suspended params={params} />
        </ViewTransition>
      </Suspense>
    </Drawer>
  )
}

async function Suspended({
  params,
}: {
  params: PageProps<'/[lang]/follow-up/[restaurantName]'>['params']
}) {
  const { restaurantName, lang } = await params

  const [{ restaurant, posts }, messages] = await Promise.all([
    getCachedRestaurantWithPostsByName(restaurantName),
    getDictionary(lang as Locale),
  ])

  if (!restaurant || !restaurant.ai_summarize || !posts) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <RestaurantDetail
        restaurant={
          restaurant as WithNonNullableKey<typeof restaurant, 'ai_summarize'>
        }
        posts={posts}
        messages={messages}
      />
    </main>
  )
}
