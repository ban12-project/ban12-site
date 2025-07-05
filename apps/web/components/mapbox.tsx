'use client'

import { Suspense, unstable_ViewTransition as ViewTransition } from 'react'
import * as React from 'react'
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

function Loader() {
  return (
    <>
      <link
        href="https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mapbox-gl/3.13.0/mapbox-gl.min.css"
        rel="stylesheet"
        crossOrigin="anonymous"
        integrity="sha512-1/8PrBC3zrZF3spK3/9XjVGnR31hCx1mnE+iX/4X7Ppc/SEEtzVOvpxyciGjW6rcrir7URC48HOnVjvMGTmLjQ=="
        referrerPolicy="no-referrer"
      />
      <Script
        src="https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/mapbox-gl/3.13.0/mapbox-gl.js"
        crossOrigin="anonymous"
        integrity="sha512-Eq4J2Zlv+fbCW4UOXL2C2hG7YZZmM1lh6iYpLgXkC1HvDR4Jtt19DRHZ3hyvIt0baSQflNoblbNola49d/7Oqw=="
        referrerPolicy="no-referrer"
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

const MapContext = React.createContext<mapboxgl.Map | null>(null)

export function useMap() {
  return React.useContext(MapContext)
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
  const mapboxgl = React.use(externalScript)
  const mapContainerRef = React.useRef<React.ComponentRef<'div'>>(null)
  const [map, setMap] = React.useState<mapboxgl.Map | null>(null)

  const { isIntersecting, ref: observerRef } = useIntersectionObserver()
  const { resolvedTheme } = useTheme()
  const { locale } = useLocale()

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!map) return

    map.easeTo({
      center: options?.center || fallbackOptions.center,
      zoom: options?.zoom || fallbackOptions.zoom,
    })
  }, [map, options])

  React.useEffect(() => {
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

// https://github.com/mapbox/mapbox-gl-js/issues/6707
export function useMapReady(
  callback: (map: mapboxgl.Map) => void | (() => void),
  deps: React.DependencyList = [],
) {
  const map = useMap()

  const id = React.useRef(NaN)
  const clean = React.useRef<ReturnType<typeof callback>>(undefined)
  const emitMapLoadEvent = React.useCallback(() => {
    map!.fire('load')
  }, [map])
  const cb = React.useCallback(() => {
    if (id.current) {
      window.cancelAnimationFrame(id.current)
      id.current = NaN
    }
    clean.current = callback(map!)

    map!.off('style.load', emitMapLoadEvent)
    map!.on('style.load', emitMapLoadEvent)
  }, [callback, map, emitMapLoadEvent])

  React.useEffect(() => {
    if (!map) return

    if (map.loaded()) {
      cb()
    } else {
      map.once('load', cb)

      const loop = () => {
        if (map.loaded()) {
          cb()
        } else {
          id.current = window.requestAnimationFrame(loop)
        }
      }

      id.current = window.requestAnimationFrame(loop)
    }

    return () => {
      clean.current?.()
    }
  }, [cb, map, ...deps])
}

interface MarkerProps {
  options?: Partial<ConstructorParameters<Mapbox['Marker']>[0]>
  lnglat: mapboxgl.LngLatLike
  container?: (innerHTML: string) => React.ReactNode
}

function PureMarker({ lnglat, options, container }: MarkerProps) {
  const [marker, setMarker] = React.useState<mapboxgl.Marker | null>(null)

  useMapReady((map) => {
    const marker = new window.mapboxgl.Marker(options)
      .setLngLat(lnglat)
      .addTo(map)
    setMarker(marker)

    return () => {
      marker?.remove()
      setMarker(null)
    }
  })

  if (!container) return null
  if (!marker) return null

  const portalContainer = marker.getElement()
  const innerHTML = portalContainer.innerHTML
  portalContainer.innerHTML = ''
  return createPortal(container(innerHTML), portalContainer)
}
export const Marker = React.memo(PureMarker, (prev, next) => {
  if (!equal(prev.lnglat, next.lnglat)) return false
  if (!equal(prev.options, next.options)) return false
  return true
})

export default function Mapbox(props: Omit<Props, 'externalScript'>) {
  const mapboxResourcesPromise = React.useCallback(
    () =>
      new Promise<Mapbox>((resolve) => {
        if (window.mapboxgl) return resolve(window.mapboxgl)

        const listener = () => {
          resolve(window.mapboxgl)
          document.removeEventListener('mapboxloaded', listener)
        }
        document.addEventListener('mapboxloaded', listener)
      }),
    [],
  )

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
