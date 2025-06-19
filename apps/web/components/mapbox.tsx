'use client'

import {
  createContext,
  memo,
  Suspense,
  use,
  useContext,
  useEffect,
  useRef,
  useState,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import Script from 'next/script'
import { useLocale } from '@repo/i18n/client'
import equal from 'fast-deep-equal'
import { LoaderCircleIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createPortal } from 'react-dom'
import { useIntersectionObserver } from 'usehooks-ts'

type Mapbox = typeof import('mapbox-gl').default

declare global {
  interface Window {
    mapboxgl: Mapbox
  }
}

const mapboxResourcesPromise = () =>
  new Promise<Mapbox>((resolve) => {
    if (window.mapboxgl) return resolve(window.mapboxgl)

    const listener = () => {
      resolve(window.mapboxgl)
      document.removeEventListener('mapboxloaded', listener)
    }
    document.addEventListener('mapboxloaded', listener)
  })

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
  externalScript: Promise<Mapbox>
  options?: Partial<mapboxgl.MapOptions>
}

const MapContext = createContext<mapboxgl.Map | null>(null)

export function useMap() {
  return useContext(MapContext)
}

const fallbackOptions = {
  center: [104.1954, 35.8617] as [number, number],
  zoom: 9,
} satisfies Omit<mapboxgl.MapOptions, 'container'>

function MapboxImpl({
  externalScript,
  options = fallbackOptions,
  ref,
  children,
  ...props
}: Props) {
  const mapboxgl = use(externalScript)
  const mapContainerRef = useRef<React.ComponentRef<'div'>>(null)
  const [map, setMap] = useState<mapboxgl.Map | null>(null)

  const { isIntersecting, ref: observerRef } = useIntersectionObserver()
  const { resolvedTheme } = useTheme()
  const { locale } = useLocale()

  useEffect(() => {
    const container = mapContainerRef.current
    if (map || !container || !isIntersecting) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    const newMap = new mapboxgl.Map({
      container,
      style:
        resolvedTheme === 'dark'
          ? 'mapbox://styles/mapbox/dark-v11'
          : 'mapbox://styles/mapbox/light-v11',
      language: locale === 'zh-CN' ? 'zh-Hans' : locale,
      ...options,
      center: options?.center || fallbackOptions.center,
      zoom: options?.zoom || fallbackOptions.zoom,
    })

    setMap(newMap)

    return () => {
      newMap.remove()
      setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxgl, isIntersecting])

  useEffect(() => {
    if (!map) return
    map.setStyle(
      resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
    )

    map.setCenter(options?.center || fallbackOptions.center)
    map.setZoom(options?.zoom || fallbackOptions.zoom)
  }, [map, resolvedTheme, options])

  const mergeRefs = (el: React.ComponentRef<'div'>) => {
    if (typeof ref === 'function') ref(el)
    else if (ref != null) ref.current = el
    mapContainerRef.current = el
    observerRef(el)
  }

  return (
    <div {...props} ref={mergeRefs}>
      <MapContext.Provider value={map}>{children}</MapContext.Provider>
    </div>
  )
}

interface MarkerProps {
  options?: Partial<ConstructorParameters<Mapbox['Marker']>[0]>
  lnglat: mapboxgl.LngLatLike
  container?: (innerHTML: string) => React.ReactNode
}

function PureMarker({ lnglat, options, container }: MarkerProps) {
  const map = useMap()
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!map) return

    const genMarker = () => {
      const marker = new window.mapboxgl.Marker(options)
        .setLngLat(lnglat)
        .addTo(map)
      setMarker(marker)
    }
    if (map.loaded()) {
      genMarker()
    } else {
      map.once('load', genMarker)
    }

    return () => {
      setMarker(null)
      marker?.remove()
    }
  }, [lnglat, map, options])

  if (!container) return null
  if (!marker) return null

  const portalContainer = marker.getElement()
  const innerHTML = portalContainer.innerHTML
  portalContainer.innerHTML = ''
  return createPortal(container(innerHTML), portalContainer)
}
export const Marker = memo(PureMarker, (prev, next) => {
  if (!equal(prev.lnglat, next.lnglat)) return false
  if (!equal(prev.options, next.options)) return false
  return true
})

export default function Mapbox(props: Omit<Props, 'externalScript'>) {
  return (
    <>
      <Loader />
      <Suspense
        fallback={
          <ViewTransition exit="mapbox-fallback-exit">
            <div className="slide-in-from-bottom-10 fade-in fill-mode-forwards animate-in flex h-screen items-center justify-center ease-[cubic-bezier(0.7,0,0.3,1)]">
              <LoaderCircleIcon className="animate-spin" />
            </div>
          </ViewTransition>
        }
      >
        <ViewTransition enter="mapbox-enter">
          <MapboxImpl externalScript={mapboxResourcesPromise()} {...props} />
        </ViewTransition>
      </Suspense>
    </>
  )
}
