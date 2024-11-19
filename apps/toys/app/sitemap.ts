import type { MetadataRoute } from 'next'
import { i18n } from '#/i18n'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = Object.keys(i18n.locales)

  const routesMap: MetadataRoute.Sitemap = ['', '/hash', '/7-zip'].map(
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
  )

  return routesMap
}
