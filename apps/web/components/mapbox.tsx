'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { useLocale } from '@repo/i18n/client';
import equal from 'fast-deep-equal';
import mapboxgl, { type MarkerOptions } from 'mapbox-gl';
import { useTheme } from 'next-themes';
import * as React from 'react';
import ReactDOM from 'react-dom';

interface Props extends React.ComponentProps<'div'> {
  options?: Partial<mapboxgl.MapOptions>;
  controls?: boolean;
}

const MapContext = React.createContext<mapboxgl.Map | null>(null);

export function useMap() {
  return React.useContext(MapContext);
}

const fallbackOptions = {
  center: [104.1954, 35.8617] as [number, number],
  zoom: 9,
} satisfies Omit<mapboxgl.MapOptions, 'container'>;

export function Mapbox({
  options = fallbackOptions,
  controls = false,
  ref,
  children,
  ...props
}: Props) {
  const mapContainerRef = React.useRef<React.ComponentRef<'div'>>(null!);
  const [map, setMap] = React.useState<mapboxgl.Map | null>(null);
  const [error, setError] = React.useState<unknown>(null);

  const { resolvedTheme } = useTheme();
  const { locale } = useLocale();
  const mapLanguage = locale === 'zh-CN' ? 'zh-Hans' : locale;
  const lightPreset = resolvedTheme === 'dark' ? 'night' : 'day';

  // biome-ignore lint/correctness/useExhaustiveDependencies: initialization
  React.useEffect(() => {
    const container = mapContainerRef.current;
    // reuse map instance, reduce cost
    if (map) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const newMap = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/standard',
      config: {
        basemap: {
          lightPreset,
          showPointOfInterestLabels: true,
          showTransitLabels: false,
        },
      },
      language: mapLanguage,
      attributionControl: false,
      logoPosition: 'bottom-right',
      localIdeographFontFamily: 'sans-serif',
      ...options,
      center: options?.center || fallbackOptions.center,
      zoom: options?.zoom || fallbackOptions.zoom,
    });
    const onError = (event: mapboxgl.ErrorEvent) => {
      setError(event.error);
    };

    newMap.on('error', onError);
    setMap(newMap);

    return () => {
      newMap.off('error', onError);
      newMap.remove();
      setMap(null);
    };
  }, []);

  React.useEffect(() => {
    if (!map) return;

    map.easeTo({
      center: options?.center || fallbackOptions.center,
      zoom: options?.zoom || fallbackOptions.zoom,
    });
  }, [map, options]);

  React.useEffect(() => {
    if (!map) return;

    map.setConfigProperty('basemap', 'lightPreset', lightPreset);
  }, [lightPreset, map]);

  React.useEffect(() => {
    if (!map) return;

    map.setLanguage(mapLanguage);
  }, [map, mapLanguage]);

  React.useEffect(() => {
    if (!map || !controls) return;

    const navigation = new mapboxgl.NavigationControl({
      showCompass: true,
      visualizePitch: true,
    });
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      showAccuracyCircle: false,
      showUserHeading: true,
      trackUserLocation: false,
    });
    const scale = new mapboxgl.ScaleControl({ unit: 'metric' });

    map.addControl(navigation, 'bottom-right');
    map.addControl(geolocate, 'bottom-right');
    map.addControl(scale, 'bottom-left');

    return () => {
      map.removeControl(navigation);
      map.removeControl(geolocate);
      map.removeControl(scale);
    };
  }, [controls, map]);

  const mergeRefs = (el: React.ComponentRef<'div'>) => {
    if (typeof ref === 'function') ref(el);
    else if (ref != null) ref.current = el;
    mapContainerRef.current = el;
  };

  return (
    <>
      <div {...props} ref={mergeRefs}></div>
      {error && (
        <div className="pointer-events-none fixed inset-x-4 bottom-safe-max-4 z-20 rounded-md border bg-background/90 p-3 text-sm shadow-lg backdrop-blur">
          Map failed to load. Check the Mapbox token and network connection.
        </div>
      )}
      <MapContext.Provider value={map}>{children}</MapContext.Provider>
    </>
  );
}

// https://github.com/mapbox/mapbox-gl-js/issues/6707
export function useMapStyleReady(
  callback: (map: mapboxgl.Map) => undefined | (() => void),
  deps: React.DependencyList = [],
) {
  const map = useMap();

  const cb = React.useCallback(() => {
    return callback(map!);
  }, [callback, map]);

  React.useEffect(() => {
    if (!map) return;

    let clean: ReturnType<typeof callback> | undefined;
    let rafId = 0;

    const run = () => {
      clean?.();
      clean = cb();
    };

    const listener = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = 0;
      run();
    };
    if (map.loaded() && map.isStyleLoaded()) {
      run();
    } else {
      map.on('load', listener);
      map.on('style.load', listener);

      const loop = () => {
        if (map.loaded() && map.isStyleLoaded()) {
          if (rafId) window.cancelAnimationFrame(rafId);
          rafId = 0;
          run();
        } else {
          rafId = window.requestAnimationFrame(loop);
        }
      };

      rafId = window.requestAnimationFrame(loop);
    }

    return () => {
      map.off('load', listener);
      map.off('style.load', listener);
      if (rafId) window.cancelAnimationFrame(rafId);
      clean?.();
    };
  }, [cb, map, ...deps]);
}

export const useMapReady = useMapStyleReady;

interface MarkerProps {
  options?: MarkerOptions;
  lnglat: mapboxgl.LngLatLike;
  container?: (innerHTML: string) => React.ReactNode;
}

function PureMarker({ lnglat, options, container }: MarkerProps) {
  const [marker, setMarker] = React.useState<mapboxgl.Marker | null>(null);

  useMapReady((map) => {
    const marker = new mapboxgl.Marker(options).setLngLat(lnglat).addTo(map);
    setMarker(marker);

    return () => {
      marker?.remove();
      setMarker(null);
    };
  });

  if (!container) return null;
  if (!marker) return null;

  const portalContainer = marker.getElement();
  const innerHTML = portalContainer.innerHTML;
  portalContainer.innerHTML = '';
  return ReactDOM.createPortal(container(innerHTML), portalContainer);
}
export const Marker = React.memo(PureMarker, (prev, next) => {
  if (!equal(prev.lnglat, next.lnglat)) return false;
  if (!equal(prev.options, next.options)) return false;
  return true;
});

export function PreloadResources() {
  ReactDOM.prefetchDNS('https://api.mapbox.com');
  ReactDOM.prefetchDNS('https://events.mapbox.com');

  return null;
}
