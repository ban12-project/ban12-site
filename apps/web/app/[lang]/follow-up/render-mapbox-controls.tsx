'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@repo/i18n/client'
import coordtransform from 'coordtransform'
import equal from 'fast-deep-equal'
import { useTheme } from 'next-themes'

import { SelectRestaurant } from '#/lib/db/schema'
import { Marker, useMapReady } from '#/components/mapbox'

export default function RenderMapboxControls({
  restaurants,
  location,
}: {
  restaurants: Promise<SelectRestaurant[]>
  location?: [number, number]
}) {
  const data = React.use(restaurants)

  const validRestaurants = data.filter(({ location, invisible }) => {
    return location && !invisible
  })

  return (
    <>
      <Clusters restaurants={validRestaurants} />
      {location && <Marker lnglat={location} />}
    </>
  )
}

const Clusters = React.memo(
  function Clusters({ restaurants }: { restaurants: SelectRestaurant[] }) {
    const router = useRouter()
    const { resolvedTheme } = useTheme()

    useMapReady((map) => {
      map.addSource('restaurants', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: restaurants
            .map(({ location, ai_summarize, id }) => {
              const [lng, lat] = coordtransform.gcj02towgs84(...location!)
              return {
                type: 'Feature' as const,
                properties: {
                  id,
                  ...ai_summarize,
                },
                geometry: {
                  type: 'Point' as const,
                  coordinates: [lng, lat],
                },
              }
            })
            .filter(Boolean),
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'restaurants',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FFCADE',
            10,
            '#EC85AD',
            50,
            '#CC3366',
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40,
          ],
          'circle-emissive-strength': 1,
        },
      })

      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'restaurants',
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 16,
        },
      })

      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'restaurants',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'restaurantName'],
        },
        paint: {
          'text-color': resolvedTheme === 'dark' ? '#7DD7BE' : '#004F3C',
        },
      })

      // inspect a cluster on click
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })
        const clusterId: number = features[0].properties!.cluster_id
        map
          .getSource<mapboxgl.GeoJSONSource>('restaurants')!
          .getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err || !zoom) return

            map.easeTo({
              center: (features[0].geometry as GeoJSON.Point).coordinates as [
                number,
                number,
              ],
              zoom,
            })
          })
      })

      // When a click event occurs on a feature in
      // the unclustered-point layer, open a popup at
      // the location of the feature, with
      // description HTML from its properties.
      map.on('click', 'unclustered-point', (e) => {
        const coordinates = (
          e.features![0].geometry as GeoJSON.Point
        ).coordinates.slice() as [number, number]

        // Ensure that if the map is zoomed out such that
        // multiple copies of the feature are visible, the
        // popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        router.push(`/follow-up/${e.features![0].properties?.restaurantName}`)
      })

      map.on('mouseenter', 'unclustered-point', (e) => {
        router.prefetch(`/follow-up/${e.features![0].properties?.restaurantName}`)
      })

      map.on('mouseenter', ['clusters', 'unclustered-point'], () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', ['clusters', 'unclustered-point'], () => {
        map.getCanvas().style.cursor = ''
      })

      return () => {
        map.removeLayer('clusters')
        map.removeLayer('cluster-count')
        map.removeLayer('unclustered-point')
        map.removeSource('restaurants')
      }
    })

    return null
  },
  (prev, next) => {
    if (!equal(prev.restaurants, next.restaurants)) return false
    return true
  },
)
