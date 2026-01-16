import { Link } from '@repo/i18n/client';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getRestaurants } from '#/lib/db/queries';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';

import { getCachedRestaurantWithPostsByName } from '../actions';
import RestaurantDetail from './restaurant-detail';

export async function generateStaticParams() {
  const restaurants = await getRestaurants();
  return restaurants.map((restaurant) => ({
    restaurantName: restaurant.ai_summarize?.restaurantName,
  }));
}

export default async function Page({
  params,
}: PageProps<'/[lang]/follow-up/[restaurantName]'>) {
  const { restaurantName, lang } = await params;
  const [{ restaurant, posts }, messages] = await Promise.all([
    getCachedRestaurantWithPostsByName(restaurantName),
    getDictionary(lang as Locale),
  ]);

  if (!restaurant || !restaurant.ai_summarize) {
    notFound();
  }

  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'Restaurant',
    name: restaurant.ai_summarize.restaurantName,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.ai_summarize.restaurantAddress,
    },
    servesCuisine: restaurant.ai_summarize.dishes,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: restaurant.ai_summarize.rating,
      ratingCount: 5,
    },
    priceRange: restaurant.ai_summarize.price,
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <RestaurantDetail
        restaurant={
          restaurant as WithNonNullableKey<typeof restaurant, 'ai_summarize'>
        }
        posts={posts}
        messages={messages}
      />

      <Link className="inline-block py-2" href="/follow-up">
        See more restaurants
      </Link>

      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: ld json
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/follow-up/[restaurantName]'>): Promise<Metadata> {
  const { restaurantName } = await params;
  const { restaurant } =
    await getCachedRestaurantWithPostsByName(restaurantName);

  if (!restaurant || !restaurant.ai_summarize) {
    notFound();
  }

  const name = restaurant.ai_summarize.restaurantName;
  const title = `${name} - Restaurant Review`;

  if (!process.env.NEXT_PUBLIC_HOST_URL) {
    throw new Error('NEXT_PUBLIC_HOST_URL is not defined');
  }

  return {
    title,
    description: `Read reviews and information about ${name}, including dishes, service quality, and more.`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL),
    alternates: {
      canonical: `/follow-up/${name}`,
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [
          lang,
          `/${lang}/follow-up/${name}`,
        ]),
      ),
    },
    openGraph: {
      title,
    },
  };
}
