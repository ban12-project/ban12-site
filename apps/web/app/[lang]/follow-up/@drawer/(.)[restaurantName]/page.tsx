import { Suspense, unstable_ViewTransition as ViewTransition } from 'react'
import { notFound } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'

import { getDictionary, type Locale, type Messages } from '#/lib/i18n'

import RestaurantDetail from '../../[restaurantName]/restaurant-detail'
import { getCachedRestaurantWithPostsByName } from '../../actions'
import Drawer from './drawer'

export default async function Page({
  params,
}: PageProps<'/[lang]/follow-up/[restaurantName]'>) {
  const { restaurantName, lang } = await params
  const messages = await getDictionary(lang as Locale)

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
          <Suspended restaurantName={restaurantName} messages={messages} />
        </ViewTransition>
      </Suspense>
    </Drawer>
  )
}

async function Suspended({
  restaurantName,
  messages,
}: {
  restaurantName: string
  messages: Messages
}) {
  const { restaurant, posts } =
    await getCachedRestaurantWithPostsByName(restaurantName)

  if (!restaurant || !restaurant.ai_summarize) {
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
