'use client'

import dynamic from 'next/dynamic'
import { preload } from 'react-dom'

const Mapbox = dynamic(() => import('#/components/mapbox'), {
  ssr: false,
})

export default function MapboxClientOnly(
  props: React.ComponentProps<typeof Mapbox>,
) {
  preload('https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.css', {
    as: 'style',
  })
  preload('https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.js', {
    as: 'script',
    crossOrigin: 'anonymous',
  })

  return <Mapbox {...props} />
}
