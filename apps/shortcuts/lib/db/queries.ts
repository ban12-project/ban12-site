import 'server-only'

import { cache } from 'react'
import { Redis } from '@upstash/redis'
import { eq, or, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'

import * as schema from './schema'
import {
  album,
  collection,
  shortcut,
  type LocalizedString,
  type SelectShortcut,
} from './schema'

const redis = Redis.fromEnv()

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

export const db = drizzle(connectionString, { schema })

const CACHE_TTL = {
  SHORTCUT: 3600, // 1小时
  SHORTCUTS_BY_ALBUM: 1800, // 30分钟
  ALBUMS: 3600, // 1小时
  COLLECTIONS: 3600, // 1小时
  ALBUMS_WITH_SHORTCUTS: 1800, // 30分钟
  SEARCH: 900, // 15分钟
}

export async function getUser(email: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    })
    return user
  } catch (error) {
    console.error('Failed to get user from database')
    throw error
  }
}

/* --------------Shortcuts--------------------------- */

export async function saveShortcut({
  uuid,
  icloud,
  name,
  description,
  icon,
  backgroundColor,
  details,
  language,
  collectionId = null,
  albumId,
}: {
  uuid: string
  icloud: string
  name: LocalizedString
  description: LocalizedString
  icon: string
  backgroundColor: string
  details: string | null
  language: string
  collectionId: number | null
  albumId: number | null
}) {
  try {
    await db.insert(shortcut).values({
      updatedAt: new Date().toISOString(),
      uuid,
      icloud,
      name,
      description,
      icon,
      backgroundColor,
      details,
      language,
      collectionId,
      albumId,
    })

    await redis.del(`shortcut:uuid:${uuid}`)
    if (albumId) {
      await redis.del(`shortcuts:album:${albumId}:*`)
    }
  } catch (error) {
    console.error('Failed to save shortcut in database')
    throw error
  }
}

export async function updateShortcutByUuid({
  uuid,
  icloud,
  name,
  description,
  icon,
  backgroundColor,
  details,
  language,
  collectionId = null,
  albumId,
}: {
  uuid: string
  icloud: string
  name: LocalizedString
  description?: LocalizedString
  icon: string
  backgroundColor: string
  details: string | null
  language: string
  collectionId: number | null
  albumId: number | null
}) {
  try {
    await db
      .update(shortcut)
      .set({
        updatedAt: new Date().toISOString(),
        uuid,
        icloud,
        name,
        description,
        icon,
        backgroundColor,
        details,
        language,
        collectionId,
        albumId,
      })
      .where(eq(shortcut.uuid, uuid))

    await redis.del(`shortcut:uuid:${uuid}`)
    if (albumId) {
      await redis.del(`shortcuts:album:${albumId}:*`)
    }
  } catch (error) {
    console.error('Failed to update shortcut in database')
    throw error
  }
}

export async function deleteShortcutByUuid(uuid: string) {
  try {
    await db.delete(shortcut).where(eq(shortcut.uuid, uuid))

    await redis.del(`shortcut:uuid:${uuid}`)
  } catch (error) {
    console.error('Failed to delete shortcut in database')
    throw error
  }
}

export const getShortcuts = cache(async () => {
  try {
    const shortcuts = await db.query.shortcut.findMany()
    return shortcuts
  } catch (error) {
    console.error('Failed to get shortcuts from database')
    throw error
  }
})

export const getShortcutByUuid = cache(async (uuid: string) => {
  const cacheKey = `shortcut:uuid:${uuid}`

  try {
    const cachedShortcut = await redis.get<SelectShortcut>(cacheKey)
    if (cachedShortcut) return cachedShortcut

    const shortcut = await db.query.shortcut.findFirst({
      where: (shortcut, { eq }) => eq(shortcut.uuid, uuid),
    })

    if (shortcut) {
      await redis.set(cacheKey, shortcut, { ex: CACHE_TTL.SHORTCUT })
    }

    return shortcut
  } catch (error) {
    console.error('Failed to get shortcut from database')
    throw error
  }
})

export const getShortcutByAlbumId = cache(
  async (albumId: number, pageSize: number, currentPage: number) => {
    const cacheKey = `shortcuts:album:${albumId}:page:${currentPage}:size:${pageSize}`

    try {
      const cachedShortcuts = await redis.get<SelectShortcut[]>(cacheKey)
      if (cachedShortcuts) {
        return cachedShortcuts
      }

      const shortcuts = await db.query.shortcut.findMany({
        where: (shortcut, { eq }) => eq(shortcut.albumId, albumId),
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        orderBy: (shortcuts, { desc }) => desc(shortcuts.updatedAt),
      })

      if (shortcuts.length > 0) {
        await redis.set(cacheKey, shortcuts, {
          ex: CACHE_TTL.SHORTCUTS_BY_ALBUM,
        })
      }

      return shortcuts
    } catch (error) {
      console.error('Failed to get shortcut from database')
      throw error
    }
  },
)

export async function searchShortcutsByQuery(query: string) {
  const cacheKey = `search:${query}`

  try {
    const cachedResults = await redis.get<SelectShortcut[]>(cacheKey)
    if (cachedResults) {
      return cachedResults
    }

    const shortcuts = await db
      .select()
      .from(shortcut)
      .where(
        or(
          sql`${shortcut.name}::text ILIKE ${`%${query}%`}`,
          sql`${shortcut.description}::text ILIKE ${`%${query}%`}`,
        ),
      )

    if (shortcuts.length > 0) {
      await redis.set(cacheKey, shortcuts, { ex: CACHE_TTL.SEARCH })
    }

    return shortcuts
  } catch (error) {
    console.error('Failed to get shortcut from database')
    throw error
  }
}

/* --------------Collections--------------------------- */
export async function saveCollection({
  title,
  image,
  textColor,
}: {
  title: LocalizedString
  image: string
  textColor: string
}) {
  try {
    await db.insert(collection).values({
      updatedAt: new Date().toISOString(),
      title,
      image,
      textColor,
    })
  } catch (error) {
    console.error('Failed to save collection in database')
    throw error
  }
}

export async function updateCollectionById({
  id,
  title,
  image,
  textColor,
}: {
  id: number
  title: LocalizedString
  image: string
  textColor: string
}) {
  try {
    await db
      .update(collection)
      .set({
        updatedAt: new Date().toISOString(),
        title,
        image,
        textColor,
      })
      .where(eq(collection.id, id))
  } catch (error) {
    console.error('Failed to update collection in database')
    throw error
  }
}

export async function deleteCollectionById(id: number) {
  try {
    await db.delete(collection).where(eq(collection.id, id))
  } catch (error) {
    console.error('Failed to delete collection in database')
    throw error
  }
}

export const getCollections = cache(async () => {
  try {
    const collections = await db.query.collection.findMany()

    return collections
  } catch (error) {
    console.error('Failed to get collections from database')
    throw error
  }
})

export async function getCollectionById(id: number) {
  try {
    const collection = await db.query.collection.findFirst({
      where: (collection, { eq }) => eq(collection.id, id),
    })
    return collection
  } catch (error) {
    console.error('Failed to get collection from database')
    throw error
  }
}

export async function getCollectionByIdWithAlbumsAndShortcuts(id: number) {
  try {
    const collection = await db.query.collection.findFirst({
      where: (collection, { eq }) => eq(collection.id, id),
      with: {
        albums: {
          with: {
            shortcuts: true,
          },
        },
        shortcuts: true,
      },
    })
    return collection
  } catch (error) {
    console.error('Failed to get collection from database')
    throw error
  }
}

/* --------------Albums--------------------------- */
export async function saveAlbum({
  title,
  description,
  collectionId,
}: {
  title: LocalizedString
  description: LocalizedString
  collectionId: number | null
}) {
  try {
    await db.insert(album).values({
      updatedAt: new Date().toISOString(),
      title,
      description,
      collectionId,
    })
  } catch (error) {
    console.error('Failed to save album in database')
    throw error
  }
}

export async function updateAlbumById({
  id,
  title,
  description,
  collectionId,
}: {
  id: number
  title: LocalizedString
  description: LocalizedString
  collectionId: number | null
}) {
  try {
    await db
      .update(album)
      .set({
        updatedAt: new Date().toISOString(),
        title,
        description,
        collectionId,
      })
      .where(eq(album.id, id))
  } catch (error) {
    console.error('Failed to update album in database')
    throw error
  }
}

export async function deleteAlbumById(id: number) {
  try {
    await db.delete(album).where(eq(album.id, id))
  } catch (error) {
    console.error('Failed to delete album in database')
    throw error
  }
}

export const getAlbums = cache(async () => {
  try {
    const albums = await db.query.album.findMany()

    return albums
  } catch (error) {
    console.error('Failed to get albums from database')
    throw error
  }
})

export async function getAlbumById(id: number) {
  try {
    const album = await db.query.album.findFirst({
      where: (album, { eq }) => eq(album.id, id),
    })
    return album
  } catch (error) {
    console.error('Failed to get album from database')
    throw error
  }
}

export const getAlbumsWithShortcuts = cache(async (pageSize?: number) => {
  try {
    const albums = await db.query.album.findMany({
      with: {
        // use pageSize to limit the number of records returned, if not provided, return all records
        shortcuts: pageSize
          ? {
              limit: pageSize,
              orderBy: (shortcuts, { desc }) => desc(shortcuts.updatedAt),
            }
          : true,
      },
    })

    return albums
  } catch (error) {
    console.error('Failed to get albums from database')
    throw error
  }
})

export async function getAlbumByIdWithShortcuts(id: number) {
  try {
    const album = await db.query.album.findFirst({
      with: {
        shortcuts: true,
      },
      where: (album, { eq }) => eq(album.id, id),
    })
    return album
  } catch (error) {
    console.error('Failed to get album from database')
    throw error
  }
}
