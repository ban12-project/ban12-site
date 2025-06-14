import { use } from 'react'
import coordtransform from 'coordtransform'

import { SelectRestaurant } from '#/lib/db/schema'
import { Marker } from '#/components/mapbox'

export default function RenderMarker({
  restaurants,
}: {
  restaurants: Promise<SelectRestaurant[]>
}) {
  const data = use(restaurants)

  return data.map(({ lng, lat, id }) => {
    if (!lng || !lat) return

    const lnglat = coordtransform.gcj02towgs84(
      ...([lng, lat].map(Number) as [number, number]),
    )

    return <Marker key={id} lnglat={lnglat} />
  })
}
