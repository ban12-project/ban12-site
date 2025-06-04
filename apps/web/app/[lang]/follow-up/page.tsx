import { headers } from 'next/headers'

import { getRestaurants } from '#/lib/db/queries'
import { getDictionary, type Locale } from '#/lib/i18n'
import { CommandMenu } from '#/components/command-menu'

import MapboxClientWrapper from './mapbox-client-wrapper'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
}>

const fallback = {
  lng: 104.1954,
  lat: 35.8617,
}

export default async function FollowUp({ params }: Props) {
  const { lang } = await params
  const message = await getDictionary(lang)
  const headersList = await headers()
  const latitude = headersList.get('x-vercel-ip-latitude')
  const longitude = headersList.get('x-vercel-ip-longitude')
  const restaurants = getRestaurants()

  return (
    <main className="relative">
      <MapboxClientWrapper
        className="h-screen"
        options={{
          center: [
            longitude ? +longitude : fallback.lng,
            latitude ? +latitude : fallback.lat,
          ],
        }}
      />
      <CommandMenu restaurants={restaurants} />
    </main>
  )
}
