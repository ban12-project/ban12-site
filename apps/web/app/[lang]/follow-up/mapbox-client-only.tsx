'use client'

import dynamic from 'next/dynamic'
import { preload } from 'react-dom'

const Mapbox = dynamic(() => import('#/components/mapbox'), {
  ssr: false,
})

export default function MapboxClientOnly(
  props: React.ComponentProps<typeof Mapbox>,
) {
  preload(
    'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mapbox-gl/3.13.0/mapbox-gl.min.css',
    {
      as: 'style',
      crossOrigin: 'anonymous',
      integrity:
        'sha512-1/8PrBC3zrZF3spK3/9XjVGnR31hCx1mnE+iX/4X7Ppc/SEEtzVOvpxyciGjW6rcrir7URC48HOnVjvMGTmLjQ==',
      referrerPolicy: 'no-referrer',
    },
  )
  preload(
    'https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mapbox-gl/3.13.0/mapbox-gl.js',
    {
      as: 'script',
      crossOrigin: 'anonymous',
      integrity:
        'sha512-Eq4J2Zlv+fbCW4UOXL2C2hG7YZZmM1lh6iYpLgXkC1HvDR4Jtt19DRHZ3hyvIt0baSQflNoblbNola49d/7Oqw==',
      referrerPolicy: 'no-referrer',
    },
  )

  return <Mapbox {...props} />
}
