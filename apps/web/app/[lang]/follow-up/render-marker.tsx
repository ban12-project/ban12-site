'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import coordtransform from 'coordtransform'

import { SelectRestaurant } from '#/lib/db/schema'
import { Marker } from '#/components/mapbox'

export default function RenderMarker({
  restaurants,
}: {
  restaurants: Promise<SelectRestaurant[]>
}) {
  const data = use(restaurants)
  const router = useRouter()

  return data.map(({ location, id, invisible }) => {
    if (!location || invisible) return

    const lnglat = coordtransform.gcj02towgs84(...location)

    return (
      <Marker
        key={id}
        lnglat={lnglat}
        onClick={() => {
          router.push(`/follow-up/${id}?drawer=1`)
        }}
      />
    )
  })
}
