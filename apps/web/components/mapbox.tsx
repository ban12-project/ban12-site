'use client'

import {
  createContext,
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
import { LoaderCircleIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useIntersectionObserver } from 'usehooks-ts'

type Mapbox = typeof import('mapbox-gl').default

declare global {
  interface Window {
    mapboxgl: Mapbox
  }
}

const mapboxResourcesPromise = new Promise<Mapbox>((resolve) => {
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
  options?: Partial<ConstructorParameters<Mapbox['Map']>[0]>
}

const MapContext = createContext<mapboxgl.Map | null>(null)

export function useMap() {
  return useContext(MapContext)
}

function MapboxImpl({
  externalScript,
  options,
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
      zoom: 9, // starting zoom
      language: locale === 'zh-CN' ? 'zh-Hans' : locale,
      ...options,
    })

    setMap(newMap)

    return () => {
      newMap.remove()
      setMap(null)
    }
  }, [mapboxgl, options, isIntersecting])

  useEffect(() => {
    if (!map) return
    map.setStyle(
      resolvedTheme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11',
    )
  }, [map, resolvedTheme])

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
}

export function Marker({ lnglat, options }: MarkerProps) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    let marker: mapboxgl.Marker | null
    map.once('load', () => {
      marker = new window.mapboxgl.Marker(options).setLngLat(lnglat).addTo(map)
    })

    return () => {
      marker?.remove()
    }
  }, [lnglat, map, options])

  return null
}

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
          <MapboxImpl externalScript={mapboxResourcesPromise} {...props} />
        </ViewTransition>
      </Suspense>
    </>
  )
}
