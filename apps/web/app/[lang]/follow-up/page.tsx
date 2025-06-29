import { Suspense } from 'react'
import { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'

import { getDictionary, type Locale } from '#/lib/i18n'
import { CommandMenu } from '#/components/command-menu'

import { getCachedRestaurants } from './actions'
import MapboxClientOnly from './mapbox-client-only'
import RenderMapboxControls from './render-mapbox-controls'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
  searchParams: Promise<{
    location?: string
    marker?: string
  }>
}>

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#292929' },
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
  ],
}

export const metadata: Metadata = {
  title: 'Follow up',
}

const preload = () => {
  void getCachedRestaurants()
}

export default async function FollowUpPage(props: Props) {
  preload()
  const { lang } = await props.params
  const messages = await getDictionary(lang)

  const restaurants = getCachedRestaurants()

  return (
    <>
      <header className="p-safe-max-4 fixed z-10 flex w-full">
        <div className="ml-auto">
          <CommandMenu restaurants={restaurants} />
        </div>
      </header>
      <main className="relative">
        <Suspense>
          <SuspendedMapbox
            searchParams={props.searchParams}
            restaurants={restaurants}
          />
        </Suspense>
      </main>
    </>
  )
}

async function SuspendedMapbox({
  searchParams,
  restaurants,
}: {
  searchParams: Props['searchParams']
  restaurants: ReturnType<typeof getCachedRestaurants>
}) {
  const [headersList, awaitedSearchParams] = await Promise.all([
    headers(),
    searchParams,
  ])

  const locationFromHeader = [
    headersList.get('x-vercel-ip-longitude'),
    headersList.get('x-vercel-ip-latitude'),
  ]
    .filter(Boolean)
    .map(Number) as [number, number]
  const location = awaitedSearchParams.location?.split(',').map(Number) as
    | [number, number]
    | undefined

  return (
    <MapboxClientOnly
      className="min-h-screen"
      options={{
        center:
          location ||
          (locationFromHeader.length ? locationFromHeader : undefined),
        zoom: location ? 15 : 9,
      }}
    >
      <Suspense>
        <RenderMapboxControls
          restaurants={restaurants}
          location={awaitedSearchParams?.marker ? location : undefined}
        />
      </Suspense>
    </MapboxClientOnly>
  )
}
