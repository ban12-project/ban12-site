'use client'

import { Suspense, use, useEffect, useRef } from 'react'
import Script from 'next/script'
import { useTheme } from 'next-themes'
import { useIntersectionObserver } from 'usehooks-ts'

type Mapbox = typeof import('mapbox-gl').default

declare global {
  interface Window {
    mapboxgl: Mapbox
  }
}

const mapboxResourcesPromise = () => {
  return new Promise<Mapbox>((resolve) => {
    if (window.mapboxgl) return resolve(window.mapboxgl)

    const listener = () => {
      resolve(window.mapboxgl)
      document.removeEventListener('mapboxloaded', listener)
    }
    document.addEventListener('mapboxloaded', listener)
  })
}

function Loader() {
  return (
    <>
      <link
        href="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css"
        rel="stylesheet"
      />
      <Script
        src="https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.js"
        crossOrigin="anonymous"
        onLoad={() => {
          document.dispatchEvent(new Event('mapboxloaded'))
        }}
      />
    </>
  )
}

interface Props extends React.ComponentProps<'div'> {
  promise: Promise<Mapbox>
  options?: Partial<ConstructorParameters<Mapbox['Map']>[0]>
}

function MapboxImpl({ promise, options, ref, ...props }: Props) {
  const mapboxgl = use(promise)
  const containerRef = useRef<React.ComponentRef<'div'>>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const { isIntersecting, ref: observerRef } = useIntersectionObserver()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const container = containerRef.current
    if (mapRef.current || !container || !isIntersecting) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    const map = new mapboxgl.Map({
      container,
      style:
        resolvedTheme === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11',
      zoom: 9, // starting zoom
      ...options,
    })

    mapRef.current = map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [mapboxgl, options, isIntersecting])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setStyle(
      resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
    )
  }, [resolvedTheme])

  const mergeRefs = (el: React.ComponentRef<'div'>) => {
    if (typeof ref === 'function') ref(el)
    else if (ref != null) ref.current = el
    containerRef.current = el
    observerRef(el)
  }

  return <div {...props} ref={mergeRefs}></div>
}

export default function Mapbox(props: Omit<Props, 'promise'>) {
  return (
    <>
      <Loader />
      <Suspense fallback={<p>loading</p>}>
        <MapboxImpl promise={mapboxResourcesPromise()} {...props} />
      </Suspense>
    </>
  )
}
