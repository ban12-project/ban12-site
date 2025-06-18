import { Suspense } from 'react'
import { headers } from 'next/headers'

import { getRestaurants } from '#/lib/db/queries'
import { getDictionary, type Locale } from '#/lib/i18n'
import { CommandMenu } from '#/components/command-menu'

import MapboxClientOnly from './mapbox-client-only'
import RenderMarker from './render-marker'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
  searchParams?: Promise<{
    location?: string
  }>
}>

export default async function FollowUp(props: Props) {
  const [{ lang }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ])
  const [message, headersList] = await Promise.all([
    getDictionary(lang),
    headers(),
  ])

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
  const restaurants = getRestaurants()

  return (
    <>
      <header className="p-safe-max-4 fixed z-10 flex w-full">
        <div className="ml-auto">
          <CommandMenu restaurants={restaurants} />
        </div>
      </header>
      <main className="relative">
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
      </main>
    </>
  )
}
