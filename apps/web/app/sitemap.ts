import type { MetadataRoute } from 'next';

import { getAllPosts } from '#/lib/blog/api';
import { getRestaurants } from '#/lib/db/queries';
import { i18n } from '#/lib/i18n';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = Object.keys(i18n.locales);

  const routesMap: MetadataRoute.Sitemap = ['', '/follow-up', '/blog'].map(
    (route) => ({
      url: `${process.env.NEXT_PUBLIC_HOST_URL}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}${route}`,
          ]),
        ),
      },
    }),
  );

  const restaurantsPromise = getRestaurants().then((restaurants) =>
    restaurants.map((item) => ({
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/follow-up/${item.ai_summarize?.restaurantName}`,
      lastModified: item.updated_at,
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/follow-up/${item.ai_summarize?.restaurantName}`,
          ]),
        ),
      },
    })),
  );

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${process.env.NEXT_PUBLIC_HOST_URL}/blog/posts/${post.slug}`,
    lastModified: new Date(post.date),
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [
          locale,
          `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/blog/posts/${post.slug}`,
        ]),
      ),
    },
  }));

  let fetchedRoutes: MetadataRoute.Sitemap = [];

  try {
    fetchedRoutes = await restaurantsPromise;
  } catch (error) {
    throw error as Error;
  }

  return [...routesMap, ...postRoutes, ...fetchedRoutes];
}
