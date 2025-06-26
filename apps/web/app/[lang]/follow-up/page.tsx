import { Suspense } from 'react'
import { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'

import { getDictionary, type Locale } from '#/lib/i18n'
import { CommandMenu } from '#/components/command-menu'

import { getCachedRestaurants } from './actions'
import MapboxClientOnly from './mapbox-client-only'
import RenderMarker from './render-marker'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
  searchParams?: Promise<{
    location?: string
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
  const [{ lang }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])
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
          <MapboxWithLocation
            searchParams={searchParams}
            restaurants={restaurants}
          />
        </Suspense>
      </main>
    </>
  )
}

async function MapboxWithLocation({
  searchParams,
  restaurants,
}: {
  searchParams: Awaited<Props['searchParams']>
  restaurants: ReturnType<typeof getCachedRestaurants>
}) {
  const headersList = await headers()

  const locationFromHeader = (() => {
    const location = [
      headersList.get('x-vercel-ip-longitude'),
      headersList.get('x-vercel-ip-latitude'),
    ]
      .filter(Boolean)
      .map(Number)

    if (location.length) return location as [number, number]
  })()
  const location = searchParams?.location?.split(',').map(Number) as
    | [number, number]
    | undefined

  return (
    <MapboxClientOnly
      className="min-h-screen"
      options={{
        center: location || locationFromHeader,
      }}
    >
      <Suspense>
        <RenderMarker restaurants={restaurants} />
      </Suspense>
    </MapboxClientOnly>
  )
}
