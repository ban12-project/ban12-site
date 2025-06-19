'use client'

import { use } from 'react'
import { Link } from '@repo/i18n/client'
import coordtransform from 'coordtransform'

import { SelectRestaurant } from '#/lib/db/schema'
import { Marker } from '#/components/mapbox'

export default function RenderMarker({
  restaurants,
}: {
  restaurants: Promise<SelectRestaurant[]>
}) {
  const data = use(restaurants)

  return data.map(({ location, id, invisible }) => {
    if (!location || invisible) return

    const lnglat = coordtransform.gcj02towgs84(...location)

    return (
      <Marker
        key={id}
        lnglat={lnglat}
        container={(innerHTML) => (
          <Link
            href={`/follow-up/${id}?drawer=1`}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
          />
        )}
      />
    )
  })
}
