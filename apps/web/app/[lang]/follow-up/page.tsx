import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Mapbox, PreloadResources } from '#/components/mapbox';
import { getDictionary, i18n, type Locale, type Messages } from '#/lib/i18n';
import { getFollowUpRestaurants } from './actions';
import RenderMapboxControls from './render-mapbox-controls';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#292929' },
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
  ],
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Follow up',
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
  alternates: {
    canonical: '/follow-up',
    languages: Object.fromEntries(
      Object.keys(i18n.locales).map((lang) => [lang, `/${lang}/follow-up`]),
    ),
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export default async function FollowUpPage(
  props: PageProps<'/[lang]/follow-up'>,
) {
  const { lang } = await props.params;
  // Start fetch immediately, pass promise to children
  const restaurants = getFollowUpRestaurants();
  const messages = await getDictionary(lang as Locale);

  return (
    <main className="relative h-lvh min-h-dvh overflow-hidden overscroll-none">
      <Suspense>
        <SuspendedMapbox
          messages={messages}
          searchParams={props.searchParams}
          restaurants={restaurants}
        />
      </Suspense>
      <PreloadResources />
    </main>
  );
}

async function SuspendedMapbox({
  messages,
  searchParams,
  restaurants,
}: {
  messages: Messages;
  searchParams: Promise<{
    location?: string;
    marker?: string;
  }>;
  restaurants: ReturnType<typeof getFollowUpRestaurants>;
}) {
  const awaitedSearchParams = await searchParams;
  const parsedLocation = awaitedSearchParams.location?.split(',').map(Number);
  const location =
    parsedLocation &&
    parsedLocation.length === 2 &&
    parsedLocation.every(Number.isFinite)
      ? (parsedLocation as [number, number])
      : undefined;

  return (
    <Mapbox
      className="h-[100lvh] min-h-dvh"
      controls
      options={{
        center: location,
        zoom: location ? 15 : 9,
        cooperativeGestures: true,
      }}
    >
      <Suspense>
        <RenderMapboxControls
          messages={messages}
          restaurants={restaurants}
          location={awaitedSearchParams?.marker ? location : undefined}
        />
      </Suspense>
    </Mapbox>
  );
}
