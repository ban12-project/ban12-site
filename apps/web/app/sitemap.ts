import type { MetadataRoute } from 'next'

import { getRestaurants } from '#/lib/db/queries'
import { i18n } from '#/lib/i18n'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = Object.keys(i18n.locales)

  const routesMap: MetadataRoute.Sitemap = ['', '/follow-up'].map((route) => ({
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
  }))

  const restaurantsPromise = getRestaurants().then((restaurants) =>
    restaurants.map((item) => ({
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/follow-up/${item.id}`,
      lastModified: item.updated_at,
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/follow-up/${item.id}`,
          ]),
        ),
      },
    })),
  )

  let fetchedRoutes: MetadataRoute.Sitemap = []

  try {
    fetchedRoutes = (await Promise.all([restaurantsPromise])).flat()
  } catch (error) {
    throw error as Error
  }

  return [...routesMap, ...fetchedRoutes]
}
