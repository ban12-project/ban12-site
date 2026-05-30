'use client';

import { useGSAP } from '@gsap/react';
import { Link, useLocale } from '@repo/i18n/client';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { cn } from '@repo/ui/lib/utils';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import {
  ChevronDown,
  ChevronUp,
  LocateFixed,
  MapPin,
  Navigation,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { ViewTransition } from 'react';
import { toast } from 'sonner';
import { Marker, useMap, useMapStyleReady } from '#/components/mapbox';
import type { Messages } from '#/lib/i18n';
import type { FollowUpRestaurant } from './actions';
import { restaurantTitleTransitionName } from './transition-names';

gsap.registerPlugin(useGSAP, Flip);

type SortMode = 'rating' | 'distance' | 'name';
type RestaurantFeatureProperties = {
  id: string;
  href: string;
  name: string;
  address: string;
  rating: number | null;
  price: string | null;
  waitingTime: string | null;
};
type RestaurantFeatureCollection = {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    properties: RestaurantFeatureProperties;
    geometry: {
      type: 'Point';
      coordinates: [number, number];
    };
  }[];
};

const ALL_VALUE = 'all';
const LAYER_IDS = [
  'restaurant-clusters',
  'restaurant-cluster-count',
  'restaurant-points-hit',
  'restaurant-points',
  'restaurant-labels',
] as const;

export default function RenderMapboxControls({
  messages,
  restaurants,
  location,
}: {
  messages: Messages;
  restaurants: Promise<FollowUpRestaurant[]>;
  location?: [number, number];
}) {
  const data = React.use(restaurants);
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [searchDraft, setSearchDraft] = React.useState(urlQuery);
  const deferredQuery = React.useDeferredValue(searchDraft);
  const [focusedId, setFocusedId] = React.useState<string | null>(null);
  const [selectedTitleTransitionId, setSelectedTitleTransitionId] =
    React.useState<string | null>(null);

  React.useEffect(() => {
    setSearchDraft(urlQuery);
  }, [urlQuery]);

  const filters = React.useMemo(
    () => ({
      q: deferredQuery.trim().toLowerCase(),
      sort: normalizeSort(searchParams.get('sort')),
      rating: Number(searchParams.get('rating') ?? 0),
      price: searchParams.get('price') ?? ALL_VALUE,
      wait: searchParams.get('wait') ?? ALL_VALUE,
      radius: Number(searchParams.get('radius') ?? 0),
    }),
    [deferredQuery, searchParams],
  );

  const visibleRestaurants = React.useMemo(() => {
    const filtered = data.filter((restaurant) => {
      if (filters.q && !restaurant.searchText.includes(filters.q)) {
        return false;
      }
      if (filters.rating && (restaurant.rating ?? 0) < filters.rating) {
        return false;
      }
      if (filters.price !== ALL_VALUE && restaurant.price !== filters.price) {
        return false;
      }
      if (
        filters.wait !== ALL_VALUE &&
        restaurant.waitingTime !== filters.wait
      ) {
        return false;
      }
      if (
        location &&
        filters.radius &&
        distanceInKilometers(location, restaurant.coordinates) > filters.radius
      ) {
        return false;
      }

      return true;
    });

    if (filters.sort === 'distance' && location) {
      return filtered
        .map((restaurant) => ({
          restaurant,
          distance: distanceInKilometers(location, restaurant.coordinates),
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(({ restaurant }) => restaurant);
    }

    return filtered.sort((a, b) => {
      if (filters.sort === 'name') return a.name.localeCompare(b.name);

      return (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name);
    });
  }, [data, filters, location]);

  const facets = React.useMemo(
    () => ({
      prices: uniqueSorted(data.map((restaurant) => restaurant.price)),
      waits: uniqueSorted(data.map((restaurant) => restaurant.waitingTime)),
    }),
    [data],
  );

  return (
    <>
      <RestaurantLayers
        restaurants={visibleRestaurants}
        focusedId={focusedId}
        setFocusedId={setFocusedId}
      />
      <FollowUpPanel
        allRestaurants={data}
        restaurants={visibleRestaurants}
        facets={facets}
        focusedId={focusedId}
        location={location}
        messages={messages}
        searchDraft={searchDraft}
        selectedTitleTransitionId={selectedTitleTransitionId}
        setFocusedId={setFocusedId}
        setSearchDraft={setSearchDraft}
        setSelectedTitleTransitionId={setSelectedTitleTransitionId}
      />
      {location && <Marker lnglat={location} />}
    </>
  );
}

function FollowUpPanel({
  allRestaurants,
  restaurants,
  facets,
  focusedId,
  location,
  messages,
  searchDraft,
  selectedTitleTransitionId,
  setFocusedId,
  setSearchDraft,
  setSelectedTitleTransitionId,
}: {
  allRestaurants: FollowUpRestaurant[];
  restaurants: FollowUpRestaurant[];
  facets: { prices: string[]; waits: string[] };
  focusedId: string | null;
  location?: [number, number];
  messages: Messages;
  searchDraft: string;
  selectedTitleTransitionId: string | null;
  setFocusedId: (id: string | null) => void;
  setSearchDraft: (value: string) => void;
  setSelectedTitleTransitionId: (id: string | null) => void;
}) {
  const map = useMap();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const panelRef = React.useRef<HTMLElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null);
  const flipStateRef = React.useRef<ReturnType<typeof Flip.getState> | null>(
    null,
  );
  const isListScrollingRef = React.useRef(false);
  const hoveredRestaurantIdRef = React.useRef<string | null>(null);
  const isComposingSearchRef = React.useRef(false);
  const lastListPointerRef = React.useRef<{ x: number; y: number } | null>(
    null,
  );
  const scrollStopTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const hoverPreviewTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const searchUrlSyncTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const activeFilterCount = countActiveFilters(searchParams, searchDraft);
  const t = messages.followUp.map;

  const restaurantById = React.useMemo(
    () => new Map(restaurants.map((restaurant) => [restaurant.id, restaurant])),
    [restaurants],
  );

  const replaceSearchQueryInUrl = React.useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);
      const queryValue = value.trim();
      if (queryValue) params.set('q', queryValue);
      else params.delete('q');

      const query = params.toString();
      React.startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams],
  );

  const scheduleSearchUrlSync = React.useCallback(
    (value: string) => {
      if (searchUrlSyncTimeoutRef.current) {
        clearTimeout(searchUrlSyncTimeoutRef.current);
      }

      searchUrlSyncTimeoutRef.current = setTimeout(() => {
        searchUrlSyncTimeoutRef.current = null;
        replaceSearchQueryInUrl(value);
      }, 250);
    },
    [replaceSearchQueryInUrl],
  );

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nativeEvent = event.nativeEvent as InputEvent;
      if (isComposingSearchRef.current || nativeEvent.isComposing) return;

      const value = event.target.value;
      setSearchDraft(value);
      scheduleSearchUrlSync(value);
    },
    [scheduleSearchUrlSync, setSearchDraft],
  );

  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      if (searchUrlSyncTimeoutRef.current) {
        clearTimeout(searchUrlSyncTimeoutRef.current);
        searchUrlSyncTimeoutRef.current = null;
      }

      const params = new URLSearchParams(searchParams);
      const currentSearch = searchDraft.trim();
      if (currentSearch) params.set('q', currentSearch);
      else params.delete('q');

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === ALL_VALUE) params.delete(key);
        else params.set(key, value);
      }

      React.startTransition(() => {
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchDraft, searchParams],
  );

  const requestGeolocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      toast.error(t.geolocationUnsupported);
      return;
    }

    startTransition(async () => {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10_000,
            }),
        );

        updateParams({
          location: `${position.coords.longitude},${position.coords.latitude}`,
          marker: '1',
          sort: 'distance',
        });
      } catch (error) {
        toast.error(
          error && typeof error === 'object' && 'message' in error
            ? (error as { message: string }).message
            : t.geolocationFailed,
        );
      }
    });
  }, [t.geolocationFailed, t.geolocationUnsupported, updateParams]);

  const fitAll = React.useCallback(() => {
    if (!map || restaurants.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    for (const restaurant of restaurants) {
      bounds.extend(restaurant.coordinates);
    }
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    map.fitBounds(bounds, {
      padding: isDesktop
        ? { top: 90, right: 80, bottom: 80, left: 420 }
        : { top: 80, right: 40, bottom: 300, left: 40 },
      maxZoom: 15,
      duration: 700,
    });
  }, [map, restaurants]);

  const clearFilters = React.useCallback(() => {
    setSearchDraft('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    if (searchUrlSyncTimeoutRef.current) {
      clearTimeout(searchUrlSyncTimeoutRef.current);
      searchUrlSyncTimeoutRef.current = null;
    }

    updateParams({
      q: null,
      sort: null,
      rating: null,
      price: null,
      wait: null,
      radius: null,
    });
  }, [setSearchDraft, updateParams]);

  const previewRestaurant = React.useCallback(
    (restaurant: FollowUpRestaurant) => {
      setFocusedId(restaurant.id);
      map?.easeTo({
        center: restaurant.coordinates,
        zoom: Math.max(map.getZoom(), 15),
        duration: 550,
      });
    },
    [map, setFocusedId],
  );

  const previewRestaurantWhenIdle = React.useCallback(
    (restaurant: FollowUpRestaurant) => {
      if (hoverPreviewTimeoutRef.current) {
        clearTimeout(hoverPreviewTimeoutRef.current);
        hoverPreviewTimeoutRef.current = null;
      }
      if (isListScrollingRef.current) return;

      hoverPreviewTimeoutRef.current = setTimeout(() => {
        hoverPreviewTimeoutRef.current = null;
        if (isListScrollingRef.current) return;
        previewRestaurant(restaurant);
      }, 100);
    },
    [previewRestaurant],
  );

  const handleListScroll = React.useCallback(() => {
    isListScrollingRef.current = true;

    if (scrollStopTimeoutRef.current) {
      clearTimeout(scrollStopTimeoutRef.current);
    }

    scrollStopTimeoutRef.current = setTimeout(() => {
      isListScrollingRef.current = false;
      scrollStopTimeoutRef.current = null;

      let hoveredRestaurantId = hoveredRestaurantIdRef.current;
      const pointer = lastListPointerRef.current;
      const hoveredElement = pointer
        ? document
            .elementFromPoint(pointer.x, pointer.y)
            ?.closest<HTMLElement>('[data-restaurant-id]')
        : null;

      if (hoveredElement?.dataset.restaurantId) {
        hoveredRestaurantId = hoveredElement.dataset.restaurantId;
        hoveredRestaurantIdRef.current = hoveredRestaurantId;
      }

      if (!hoveredRestaurantId) return;

      const restaurant = restaurantById.get(hoveredRestaurantId);
      if (restaurant) previewRestaurant(restaurant);
    }, 150);
  }, [previewRestaurant, restaurantById]);

  React.useEffect(
    () => () => {
      if (scrollStopTimeoutRef.current) {
        clearTimeout(scrollStopTimeoutRef.current);
      }
      if (hoverPreviewTimeoutRef.current) {
        clearTimeout(hoverPreviewTimeoutRef.current);
      }
      if (searchUrlSyncTimeoutRef.current) {
        clearTimeout(searchUrlSyncTimeoutRef.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (isComposingSearchRef.current) return;
    if (
      searchInputRef.current &&
      searchInputRef.current.value !== searchDraft
    ) {
      searchInputRef.current.value = searchDraft;
    }
  }, [searchDraft]);

  React.useEffect(() => {
    if (pathname.endsWith('/follow-up')) {
      setSelectedTitleTransitionId(null);
    }
  }, [pathname, setSelectedTitleTransitionId]);

  useGSAP(
    () => {
      const panel = panelRef.current;
      const flipState = flipStateRef.current;

      if (!panel) return;

      const reduceMotion = !window.matchMedia(
        '(prefers-reduced-motion: no-preference)',
      ).matches;

      gsap.killTweensOf([panel, toggleButtonRef.current].filter(Boolean));

      if (reduceMotion) {
        flipStateRef.current = null;
        return;
      }

      const tl = gsap.timeline({
        defaults: { duration: 0.34, ease: 'power3.inOut' },
        onComplete: () => {
          flipStateRef.current = null;
        },
      });

      if (flipState) {
        tl.add(
          Flip.from(flipState, {
            targets: [panel, toggleButtonRef.current].filter(Boolean),
            duration: 0.34,
            ease: 'power3.inOut',
            absolute: false,
            nested: true,
          }),
          0,
        );
      }
    },
    { dependencies: [isCollapsed], scope: panelRef },
  );

  const toggleCollapsed = React.useCallback(() => {
    const targets = [panelRef.current, toggleButtonRef.current].filter(Boolean);
    flipStateRef.current = targets.length ? Flip.getState(targets) : null;
    React.startTransition(() => {
      setIsCollapsed((value) => !value);
    });
  }, []);

  const glassClassName =
    'border border-white/30 bg-background/72 shadow-2xl shadow-black/15 saturate-150 backdrop-blur-2xl dark:border-white/10 dark:bg-background/62';

  return (
    <aside
      ref={panelRef}
      className={cn(
        'fixed bottom-safe-max-4 left-4 right-4 z-10 flex flex-col overflow-hidden rounded-lg md:bottom-auto md:left-safe-max-4 md:right-auto md:top-safe-max-4 md:w-[390px]',
        isCollapsed ? 'max-h-16' : 'max-h-[62dvh] md:max-h-[calc(100dvh-2rem)]',
        glassClassName,
      )}
      data-collapsed={isCollapsed}
    >
      <div
        className={cn(
          'shrink-0 space-y-3 border-white/20 p-3 transition-[border-color] dark:border-white/10',
          !isCollapsed && 'border-b',
        )}
      >
        <div className="relative flex min-h-10 items-center gap-2">
          {isCollapsed ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-10 min-w-0 flex-1 justify-start px-3"
                onClick={toggleCollapsed}
              >
                <Search />
                <span className="truncate">{t.searchRestaurants}</span>
              </Button>
              <span className="shrink-0 rounded-full bg-muted/70 px-2 py-1 text-xs text-muted-foreground">
                {restaurants.length}/{allRestaurants.length}
              </span>
              {activeFilterCount > 0 && (
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-200">
                  {activeFilterCount}
                </span>
              )}
            </div>
          ) : (
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                defaultValue={searchDraft}
                placeholder={t.searchRestaurants}
                className="h-10 pl-9"
                onChange={handleSearchChange}
                onCompositionStart={() => {
                  isComposingSearchRef.current = true;
                  if (searchUrlSyncTimeoutRef.current) {
                    clearTimeout(searchUrlSyncTimeoutRef.current);
                    searchUrlSyncTimeoutRef.current = null;
                  }
                }}
                onCompositionEnd={(event) => {
                  isComposingSearchRef.current = false;
                  const value = event.currentTarget.value;
                  setSearchDraft(value);
                  scheduleSearchUrlSync(value);
                }}
              />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn('bg-background/50', isCollapsed && 'hidden')}
            disabled={isPending}
            onClick={requestGeolocation}
            title={t.useCurrentLocation}
            aria-hidden={isCollapsed}
            tabIndex={isCollapsed ? -1 : undefined}
          >
            <LocateFixed />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn('bg-background/50', isCollapsed && 'hidden')}
            onClick={fitAll}
            title={t.fitResults}
            aria-hidden={isCollapsed}
            tabIndex={isCollapsed ? -1 : undefined}
          >
            <Navigation />
          </Button>
          <Button
            ref={toggleButtonRef}
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 bg-background/50"
            onClick={toggleCollapsed}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? t.expandPanel : t.collapsePanel}
          >
            {isCollapsed ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>

        <div
          className={cn(
            'grid grid-cols-2 gap-2',
            isCollapsed && 'pointer-events-none hidden',
          )}
          aria-hidden={isCollapsed}
          inert={isCollapsed}
        >
          <FilterSelect
            label={t.sort}
            value={searchParams.get('sort') ?? 'rating'}
            onValueChange={(value) => updateParams({ sort: value })}
            items={[
              ['rating', t.topRated],
              ['distance', location ? t.nearest : t.nearestNeedsLocation],
              ['name', t.name],
            ]}
          />
          <FilterSelect
            label={t.rating}
            value={searchParams.get('rating') ?? ALL_VALUE}
            onValueChange={(value) => updateParams({ rating: value })}
            items={[
              [ALL_VALUE, t.anyRating],
              ['4.5', '4.5+'],
              ['4', '4+'],
            ]}
          />
          <FilterSelect
            label={t.price}
            value={searchParams.get('price') ?? ALL_VALUE}
            onValueChange={(value) => updateParams({ price: value })}
            items={[
              [ALL_VALUE, t.anyPrice],
              ...facets.prices.map((price) => [price, price] as const),
            ]}
          />
          <FilterSelect
            label={t.radius}
            value={searchParams.get('radius') ?? ALL_VALUE}
            onValueChange={(value) => updateParams({ radius: value })}
            items={[
              [ALL_VALUE, location ? t.anyDistance : t.distanceNeedsLocation],
              ['1', formatMessage(t.withinDistance, { distance: '1 km' })],
              ['3', formatMessage(t.withinDistance, { distance: '3 km' })],
              ['5', formatMessage(t.withinDistance, { distance: '5 km' })],
              ['10', formatMessage(t.withinDistance, { distance: '10 km' })],
            ]}
          />
        </div>

        <div
          className={cn(isCollapsed && 'pointer-events-none hidden')}
          aria-hidden={isCollapsed}
          inert={isCollapsed}
        >
          <FilterSelect
            label={t.wait}
            value={searchParams.get('wait') ?? ALL_VALUE}
            onValueChange={(value) => updateParams({ wait: value })}
            items={[
              [ALL_VALUE, t.anyWaitTime],
              ...facets.waits.map((wait) => [wait, wait] as const),
            ]}
          />
        </div>

        <div
          className={cn(
            'flex items-center justify-between gap-3 text-sm',
            isCollapsed && 'pointer-events-none hidden',
          )}
          aria-hidden={isCollapsed}
          inert={isCollapsed}
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            <span>
              {restaurants.length} of {allRestaurants.length}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={clearFilters}
          >
            <RotateCcw />
            {t.reset}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'min-h-0 flex-1 overflow-auto pb-safe-max-4',
          isCollapsed && 'pointer-events-none hidden',
        )}
        aria-hidden={isCollapsed}
        inert={isCollapsed}
        onPointerMove={(event) => {
          lastListPointerRef.current = { x: event.clientX, y: event.clientY };
        }}
        onScroll={handleListScroll}
      >
        {restaurants.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">{t.noResults}</div>
        ) : (
          <ol className="divide-y divide-white/20 dark:divide-white/10">
            {restaurants.map((restaurant) => (
              <ViewTransition key={restaurant.id} default="auto">
                <RestaurantListItem
                  restaurant={restaurant}
                  active={focusedId === restaurant.id}
                  selectedTitleTransitionId={selectedTitleTransitionId}
                  distance={
                    location
                      ? distanceInKilometers(location, restaurant.coordinates)
                      : null
                  }
                  hoveredRestaurantIdRef={hoveredRestaurantIdRef}
                  hoverPreviewTimeoutRef={hoverPreviewTimeoutRef}
                  isListScrollingRef={isListScrollingRef}
                  previewRestaurant={previewRestaurantWhenIdle}
                  messages={messages}
                  setFocusedId={setFocusedId}
                  setSelectedTitleTransitionId={setSelectedTitleTransitionId}
                />
              </ViewTransition>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  items,
  onValueChange,
}: {
  label: string;
  value: string;
  items: readonly (readonly [string, string])[];
  onValueChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-full bg-background/80">
        <span className="sr-only">{label}</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RestaurantListTitle({ name }: { name: string }) {
  return (
    <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{name}</h2>
  );
}

function RestaurantListItem({
  restaurant,
  active,
  selectedTitleTransitionId,
  distance,
  hoveredRestaurantIdRef,
  hoverPreviewTimeoutRef,
  isListScrollingRef,
  messages,
  previewRestaurant,
  setFocusedId,
  setSelectedTitleTransitionId,
}: {
  restaurant: FollowUpRestaurant;
  active: boolean;
  selectedTitleTransitionId: string | null;
  distance: number | null;
  hoveredRestaurantIdRef: React.MutableRefObject<string | null>;
  hoverPreviewTimeoutRef: React.MutableRefObject<ReturnType<
    typeof setTimeout
  > | null>;
  isListScrollingRef: React.MutableRefObject<boolean>;
  messages: Messages;
  previewRestaurant: (restaurant: FollowUpRestaurant) => void;
  setFocusedId: (id: string | null) => void;
  setSelectedTitleTransitionId: (id: string | null) => void;
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = messages.followUp.map;
  const handlePreview = React.useCallback(() => {
    previewRestaurant(restaurant);
  }, [previewRestaurant, restaurant]);

  const navigateToRestaurant = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (isModifiedClick(event)) return;

      event.preventDefault();
      React.startTransition(() => {
        setSelectedTitleTransitionId(restaurant.id);
        previewRestaurant(restaurant);
        router.push(`/${locale}${restaurant.href}`);
      });
    },
    [
      locale,
      previewRestaurant,
      restaurant,
      router,
      setSelectedTitleTransitionId,
    ],
  );

  return (
    <li>
      <Link
        href={restaurant.href}
        data-restaurant-id={restaurant.id}
        className={cn(
          'block px-4 py-3 outline-none transition-colors hover:bg-accent focus-visible:bg-accent',
          active && 'bg-accent',
        )}
        onFocus={handlePreview}
        onMouseEnter={() => {
          hoveredRestaurantIdRef.current = restaurant.id;
          handlePreview();
        }}
        onMouseLeave={() => {
          if (hoveredRestaurantIdRef.current === restaurant.id) {
            hoveredRestaurantIdRef.current = null;
          }
          if (hoverPreviewTimeoutRef.current) {
            clearTimeout(hoverPreviewTimeoutRef.current);
            hoverPreviewTimeoutRef.current = null;
          }
          if (isListScrollingRef.current) return;
          setFocusedId(null);
        }}
        onClick={navigateToRestaurant}
      >
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              {selectedTitleTransitionId === restaurant.id ? (
                <RestaurantListTitle name={restaurant.name} />
              ) : (
                <ViewTransition
                  name={restaurantTitleTransitionName(restaurant.id)}
                  share="text-morph"
                  default="none"
                >
                  <RestaurantListTitle name={restaurant.name} />
                </ViewTransition>
              )}
              {restaurant.rating && (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {restaurant.rating}
                </span>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {restaurant.address}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {restaurant.price && (
                <Badge variant="secondary" title={cleanText(restaurant.price)}>
                  {shortMetaLabel(restaurant.price, t.priceDetails, messages)}
                </Badge>
              )}
              {restaurant.waitingTime && (
                <Badge
                  variant="outline"
                  title={cleanText(restaurant.waitingTime)}
                >
                  {shortMetaLabel(
                    restaurant.waitingTime,
                    t.waitDetails,
                    messages,
                  )}
                </Badge>
              )}
              {distance != null && (
                <Badge variant="outline">{formatDistance(distance)}</Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

function isModifiedClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

function RestaurantLayers({
  restaurants,
  focusedId,
  setFocusedId,
}: {
  restaurants: FollowUpRestaurant[];
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
}) {
  const map = useMap();
  const router = useRouter();
  const { locale } = useLocale();
  const prefetched = React.useRef(new Set<string>());
  const focusedIdRef = React.useRef(focusedId);

  const featureCollection = React.useMemo<RestaurantFeatureCollection>(
    () => ({
      type: 'FeatureCollection',
      features: restaurants.map((restaurant) => ({
        type: 'Feature',
        properties: {
          id: restaurant.id,
          href: restaurant.href,
          name: restaurant.name,
          address: restaurant.address,
          rating: restaurant.rating,
          price: restaurant.price,
          waitingTime: restaurant.waitingTime,
        },
        geometry: {
          type: 'Point',
          coordinates: restaurant.coordinates,
        },
      })),
    }),
    [restaurants],
  );
  const featureCollectionRef = React.useRef(featureCollection);

  React.useEffect(() => {
    focusedIdRef.current = focusedId;
    if (!map?.getLayer('restaurant-points')) return;
    setRestaurantFocusPaint(map, focusedId);
  }, [focusedId, map]);

  React.useEffect(() => {
    featureCollectionRef.current = featureCollection;
    map
      ?.getSource<mapboxgl.GeoJSONSource>('restaurants')
      ?.setData(featureCollection);
  }, [featureCollection, map]);

  const setupRestaurantLayers = React.useCallback(
    (map: mapboxgl.Map) => {
      if (!map.getSource('restaurants')) {
        map.addSource('restaurants', {
          type: 'geojson',
          data: featureCollectionRef.current,
          cluster: true,
          clusterMaxZoom: 13,
          clusterRadius: 48,
        });
      } else {
        map
          .getSource<mapboxgl.GeoJSONSource>('restaurants')
          ?.setData(featureCollectionRef.current);
      }

      if (!map.getLayer('restaurant-points')) {
        addRestaurantLayers(map);
      }
      setRestaurantFocusPaint(map, focusedIdRef.current);

      let pendingPrefetchId:
        | number
        | ReturnType<typeof globalThis.setTimeout>
        | null = null;

      const cancelPendingPrefetch = () => {
        if (pendingPrefetchId === null) return;

        if ('cancelIdleCallback' in window) {
          window.cancelIdleCallback(pendingPrefetchId as number);
        } else {
          globalThis.clearTimeout(pendingPrefetchId);
        }
        pendingPrefetchId = null;
      };

      const prefetchVisible = () => {
        cancelPendingPrefetch();

        const run = () => {
          pendingPrefetchId = null;
          if (!map.getLayer('restaurant-points-hit')) return;

          const features = map.queryRenderedFeatures({
            layers: ['restaurant-points-hit'],
          });
          for (const feature of features.slice(0, 12)) {
            const href = feature.properties?.href;
            if (typeof href !== 'string' || prefetched.current.has(href)) {
              continue;
            }
            prefetched.current.add(href);
            router.prefetch(`/${locale}${href}`);
          }
        };

        if ('requestIdleCallback' in window) {
          pendingPrefetchId = window.requestIdleCallback(run, {
            timeout: 1500,
          });
        } else {
          pendingPrefetchId = globalThis.setTimeout(run, 250);
        }
      };

      const clusterClick = (event: mapboxgl.MapMouseEvent) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: ['restaurant-clusters'],
        });
        const feature = features[0];
        const clusterId = feature?.properties?.cluster_id;
        if (typeof clusterId !== 'number') return;

        map
          .getSource<mapboxgl.GeoJSONSource>('restaurants')
          ?.getClusterExpansionZoom(clusterId, (error, zoom) => {
            if (error || !zoom) return;

            map.easeTo({
              center: (feature.geometry as GeoJSON.Point).coordinates as [
                number,
                number,
              ],
              zoom,
            });
          });
      };

      const pointClick = (event: mapboxgl.MapMouseEvent) => {
        const feature = map.queryRenderedFeatures(event.point, {
          layers: ['restaurant-points-hit'],
        })[0];
        const href = feature?.properties?.href;
        const id = feature?.properties?.id;
        if (typeof id === 'string') setFocusedId(id);
        if (typeof href === 'string') router.push(`/${locale}${href}`);
      };

      const pointerCursor = () => {
        map.getCanvas().style.cursor = 'pointer';
      };

      const resetCursor = () => {
        map.getCanvas().style.cursor = '';
      };

      map.on('click', 'restaurant-clusters', clusterClick);
      map.on('click', 'restaurant-points-hit', pointClick);
      map.on('mouseenter', 'restaurant-clusters', pointerCursor);
      map.on('mouseenter', 'restaurant-points-hit', pointerCursor);
      map.on('mouseleave', 'restaurant-clusters', resetCursor);
      map.on('mouseleave', 'restaurant-points-hit', resetCursor);
      map.on('moveend', prefetchVisible);
      map.on('idle', prefetchVisible);

      return () => {
        cancelPendingPrefetch();
        map.off('click', 'restaurant-clusters', clusterClick);
        map.off('click', 'restaurant-points-hit', pointClick);
        map.off('mouseenter', 'restaurant-clusters', pointerCursor);
        map.off('mouseenter', 'restaurant-points-hit', pointerCursor);
        map.off('mouseleave', 'restaurant-clusters', resetCursor);
        map.off('mouseleave', 'restaurant-points-hit', resetCursor);
        map.off('moveend', prefetchVisible);
        map.off('idle', prefetchVisible);

        for (const id of LAYER_IDS) {
          if (map.getLayer(id)) map.removeLayer(id);
        }
        if (map.getSource('restaurants')) map.removeSource('restaurants');
      };
    },
    [locale, router, setFocusedId],
  );

  useMapStyleReady(setupRestaurantLayers, [setupRestaurantLayers]);

  return null;
}

function addRestaurantLayers(map: mapboxgl.Map) {
  for (const id of LAYER_IDS) {
    if (map.getLayer(id)) map.removeLayer(id);
  }

  map.addLayer({
    id: 'restaurant-clusters',
    type: 'circle',
    source: 'restaurants',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#8dd8c8',
        10,
        '#f2b84b',
        40,
        '#df5b55',
      ],
      'circle-radius': ['step', ['get', 'point_count'], 18, 10, 24, 40, 32],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-emissive-strength': 0.8,
    },
  });

  map.addLayer({
    id: 'restaurant-cluster-count',
    type: 'symbol',
    source: 'restaurants',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12,
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    },
    paint: {
      'text-color': '#10201c',
    },
  });

  map.addLayer({
    id: 'restaurant-points-hit',
    type: 'circle',
    source: 'restaurants',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#000000',
      'circle-opacity': 0,
      'circle-radius': 22,
    },
  });

  map.addLayer({
    id: 'restaurant-points',
    type: 'circle',
    source: 'restaurants',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#ffffff',
      'circle-radius': 6,
      'circle-stroke-color': '#0f766e',
      'circle-stroke-width': 2,
      'circle-emissive-strength': 0.8,
    },
  });

  map.addLayer({
    id: 'restaurant-labels',
    type: 'symbol',
    source: 'restaurants',
    minzoom: 13,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'name'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 13, 11, 16, 13],
      'text-offset': [0, 1.3],
      'text-anchor': 'top',
      'text-max-width': 12,
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    },
    paint: {
      'text-color': '#103d34',
      'text-halo-color': '#ffffff',
      'text-halo-width': 1.5,
    },
  });
}

function setRestaurantFocusPaint(map: mapboxgl.Map, focusedId: string | null) {
  const selectedExpression = [
    'case',
    ['==', ['get', 'id'], focusedId ?? ''],
    true,
    false,
  ];

  map.setPaintProperty('restaurant-points', 'circle-color', [
    'case',
    selectedExpression,
    '#0f766e',
    '#ffffff',
  ]);
  map.setPaintProperty('restaurant-points', 'circle-radius', [
    'case',
    selectedExpression,
    9,
    6,
  ]);
  map.setPaintProperty('restaurant-points', 'circle-stroke-color', [
    'case',
    selectedExpression,
    '#ffffff',
    '#0f766e',
  ]);
  map.setPaintProperty('restaurant-points', 'circle-stroke-width', [
    'case',
    selectedExpression,
    3,
    2,
  ]);
}

function normalizeSort(value: string | null): SortMode {
  if (value === 'distance' || value === 'name') return value;
  return 'rating';
}

function uniqueSorted(values: (string | null)[]) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort((a, b) =>
    a.localeCompare(b),
  );
}

function countActiveFilters(
  searchParams: Pick<URLSearchParams, 'get'>,
  query = searchParams.get('q') ?? '',
) {
  return (
    ['sort', 'rating', 'price', 'wait', 'radius'].filter((key) => {
      const value = searchParams.get(key);
      return Boolean(value && value !== ALL_VALUE && value !== 'rating');
    }).length + (query.trim() ? 1 : 0)
  );
}

function cleanText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function shortMetaLabel(
  value: string | null | undefined,
  fallback: string,
  messages: Messages,
) {
  const text = cleanText(value);
  const t = messages.followUp.detail;
  if (!text) return fallback;
  if (text.length <= 24) return text;

  const priceMatch = text.match(
    /(?:around|approx(?:imately)?|about)?\s*(?:[\d.]+[-–~到至]?)?[\d.]+\s*(?:rmb|yuan|元|¥|cny)/i,
  );
  if (priceMatch) return cleanText(priceMatch[0]);

  if (/free|complimentary|免费/i.test(text)) return t.free;
  if (/affordable|good value|实惠|划算/i.test(text)) return t.goodValue;
  if (/expensive|high-end|高端|贵/i.test(text)) return t.premium;
  if (/short|fast|quick|prompt|minimal|no significant|无需|短|快/i.test(text)) {
    return t.shortWait;
  }
  if (/long|queue|half an hour|crowded|排队|久/i.test(text)) return t.longWait;

  const sentence = text.split(/[.;。；]/)[0];
  if (sentence && sentence.length <= 28) return sentence;
  return `${text.slice(0, 24).trim()}...`;
}

function formatMessage(
  template: string | undefined,
  values: Record<string, string>,
) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

function distanceInKilometers(from: [number, number], to: [number, number]) {
  const earthRadius = 6371;
  const fromLng = toRadians(from[0]);
  const fromLat = toRadians(from[1]);
  const toLng = toRadians(to[0]);
  const toLat = toRadians(to[1]);
  const deltaLat = toLat - fromLat;
  const deltaLng = toLng - fromLng;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(deltaLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(distance: number) {
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
}
