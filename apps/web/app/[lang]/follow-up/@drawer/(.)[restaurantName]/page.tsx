import { LoaderCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Suspense, ViewTransition } from 'react';
import { getRestaurants } from '#/lib/db/queries';
import { getDictionary, type Locale } from '#/lib/i18n';
import RestaurantDetail from '../../[restaurantName]/restaurant-detail';
import { getCachedRestaurantWithPostsByName } from '../../actions';
import Drawer from './drawer';

export async function generateStaticParams() {
  const restaurants = await getRestaurants();
  return restaurants.map((restaurant) => ({
    restaurantName: restaurant.ai_summarize?.restaurantName,
  }));
}

export default async function Page({
  params,
}: PageProps<'/[lang]/follow-up/[restaurantName]'>) {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);

  return (
    <Drawer closeLabel={messages.followUp.drawer.closeRestaurantDetails}>
      <Suspense
        fallback={
          <ViewTransition exit="mapbox-fallback-exit">
            <div className="slide-in-from-bottom-10 fade-in fill-mode-forwards animate-in flex h-full items-center justify-center ease-[cubic-bezier(0.7,0,0.3,1)]">
              <LoaderCircle className="animate-spin" />
            </div>
          </ViewTransition>
        }
      >
        <ViewTransition enter="mapbox-enter">
          <Suspended params={params} messages={messages} />
        </ViewTransition>
      </Suspense>
    </Drawer>
  );
}

async function Suspended({
  messages,
  params,
}: {
  messages: Awaited<ReturnType<typeof getDictionary>>;
  params: PageProps<'/[lang]/follow-up/[restaurantName]'>['params'];
}) {
  const { restaurantName } = await params;

  const { restaurant, posts } =
    await getCachedRestaurantWithPostsByName(restaurantName);

  if (!restaurant?.ai_summarize || !posts) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <RestaurantDetail
        restaurant={
          restaurant as WithNonNullableKey<typeof restaurant, 'ai_summarize'>
        }
        posts={posts}
        messages={messages}
      />
    </main>
  );
}
