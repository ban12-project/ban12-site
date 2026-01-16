'use client';

import { useLocale } from '@repo/i18n/client';
import coordtransform from 'coordtransform';
import equal from 'fast-deep-equal';
import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as React from 'react';
import { Marker, useMapReady } from '#/components/mapbox';
import type { SelectRestaurant } from '#/lib/db/schema';

export default function RenderMapboxControls({
  restaurants,
  location,
}: {
  restaurants: Promise<SelectRestaurant[]>;
  location?: [number, number];
}) {
  const data = React.use(restaurants);

  const validRestaurants = data.filter(({ location, invisible }) => {
    return location && !invisible;
  });

  return (
    <>
      <Clusters restaurants={validRestaurants} />
      {location && <Marker lnglat={location} />}
    </>
  );
}

const Clusters = React.memo(
  function Clusters({ restaurants }: { restaurants: SelectRestaurant[] }) {
    const router = useRouter();
    const { resolvedTheme } = useTheme();
    const { locale } = useLocale();

    useMapReady(
      (map) => {
        map.addSource('restaurants', {
          type: 'geojson',
          generateId: true,
          data: {
            type: 'FeatureCollection',
            features: restaurants.map(({ location, ai_summarize }) => {
              const [lng, lat] = coordtransform.gcj02towgs84(...location!);
              return {
                type: 'Feature' as const,
                properties: {
                  ...ai_summarize,
                },
                geometry: {
                  type: 'Point' as const,
                  coordinates: [lng, lat],
                },
              };
            }),
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

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
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'restaurants',
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 16,
          },
        });

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
        });

        const prefetchFeaturesInViewport = () => {
          const features = map.queryRenderedFeatures({
            layers: ['unclustered-point'],
          });

          for (const feature of features) {
            router.prefetch(
              `/${locale}/follow-up/${feature.properties!.restaurantName}`,
              {
                kind: PrefetchKind.FULL,
              },
            );
          }
        };
        const clustersClick = (e: mapboxgl.MapMouseEvent) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          const clusterId: number = features[0].properties!.cluster_id;
          map
            .getSource<mapboxgl.GeoJSONSource>('restaurants')!
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err || !zoom) return;

              map.easeTo({
                center: (features[0].geometry as GeoJSON.Point).coordinates as [
                  number,
                  number,
                ],
                zoom,
              });
            });
        };
        const unclusteredPointClick = (e: mapboxgl.MapMouseEvent) => {
          router.push(
            `/${locale}/follow-up/${e.features![0].properties?.restaurantName}`,
          );
        };
        const changeMapCursorToPointer = () => {
          map.getCanvas().style.cursor = 'pointer';
        };
        const resetMapCursor = () => {
          map.getCanvas().style.cursor = '';
        };
        // inspect a cluster on click
        map.on('click', 'clusters', clustersClick);
        map.on('click', 'unclustered-point', unclusteredPointClick);
        map.on('moveend', prefetchFeaturesInViewport);
        map.on('idle', prefetchFeaturesInViewport);
        map.on(
          'mouseenter',
          ['clusters', 'unclustered-point'],
          changeMapCursorToPointer,
        );
        map.on('mouseleave', ['clusters', 'unclustered-point'], resetMapCursor);

        return () => {
          map.off('click', 'clusters', clustersClick);
          map.off('click', 'unclustered-point', unclusteredPointClick);
          map.off('moveend', prefetchFeaturesInViewport);
          map.off('idle', prefetchFeaturesInViewport);
          map.off(
            'mouseenter',
            ['clusters', 'unclustered-point'],
            changeMapCursorToPointer,
          );
          map.off(
            'mouseleave',
            ['clusters', 'unclustered-point'],
            resetMapCursor,
          );
          map.removeLayer('clusters');
          map.removeLayer('cluster-count');
          map.removeLayer('unclustered-point');
          map.removeSource('restaurants');
        };
      },
      [resolvedTheme],
    );

    return null;
  },
  (prev, next) => {
    if (!equal(prev.restaurants, next.restaurants)) return false;
    return true;
  },
);
