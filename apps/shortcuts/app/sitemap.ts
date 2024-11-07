import type { MetadataRoute } from 'next'
import { i18n } from '#/i18n'

import { getAlbums, getCollections, getShortcuts } from '#/lib/actions'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const shortcutsPromise = getShortcuts().then((shortcuts) =>
    shortcuts.map((shortcut) => ({
      url: `${process.env.NEXT_PUBLIC_HOST_URL}/get/${shortcut.uuid}`,
      lastModified: new Date(shortcut.updatedAt),
      alternates: {
        languages: Object.fromEntries(
          locales.map((locale) => [
            locale,
            `${process.env.NEXT_PUBLIC_HOST_URL}/${locale}/get/${shortcut.uuid}`,
          ]),
        ),
      },
    })),
  )

  const collectionsPromise = getCollections().then((collections) =>
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

  const albumsPromise = getAlbums().then((albums) =>
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
    throw error as Error
  }

  return [...routesMap, ...fetchedRoutes]
}
