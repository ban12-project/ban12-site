import type { MetadataRoute } from 'next'
import { Pool } from '@neondatabase/serverless'
import type { Album, Collection, Shortcut } from '@prisma/client'
import { i18n } from '#/i18n-config'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const connectionString = `${process.env.DATABASE_URL}`
  const pool = new Pool({ connectionString })
  const locales = Object.keys(i18n.locales)

  const routesMap: MetadataRoute.Sitemap = [''].map((route) => ({
    url: `${process.env.NEXT_PUBLIC_HOST_URL}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [
          locale,
          `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}`,
        ]),
      ),
    },
  }))

  const shortcutsPromise = pool
    .query<Shortcut>('SELECT * FROM Shortcut')
    .then(({ rows: shortcuts }) =>
      shortcuts.map((shortcut) => ({
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/get/${shortcut.id}`,
        lastModified: new Date(shortcut.updatedAt),
        alternates: {
          languages: Object.fromEntries(
            locales.map((locale) => [
              locale,
              `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/get/${shortcut.id}`,
            ]),
          ),
        },
      })),
    )

  const collectionsPromise = pool
    .query<Collection>('SELECT * FROM Collection')
    .then(({ rows: collections }) =>
      collections.map((collection) => ({
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/collection/${collection.id}`,
        lastModified: new Date(collection.updatedAt),
        alternates: {
          languages: Object.fromEntries(
            locales.map((locale) => [
              locale,
              `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/collection/${collection.id}`,
            ]),
          ),
        },
      })),
    )

  const albumsPromise = pool
    .query<Album>('SELECT * FROM Album')
    .then(({ rows: albums }) =>
      albums.map((album) => ({
        url: `${process.env.NEXT_PUBLIC_HOST_URL}/album/${album.id}`,
        lastModified: new Date(album.updatedAt),
        alternates: {
          languages: Object.fromEntries(
            locales.map((locale) => [
              locale,
              `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/album/${album.id}`,
            ]),
          ),
        },
      })),
    )

  let fetchedRoutes: MetadataRoute.Sitemap = []

  try {
    fetchedRoutes = (
      await Promise.all([shortcutsPromise, collectionsPromise, albumsPromise])
    ).flat()
  } catch (error) {
    throw JSON.stringify(error, null, 2)
  }

  return [...routesMap, ...fetchedRoutes]
}
