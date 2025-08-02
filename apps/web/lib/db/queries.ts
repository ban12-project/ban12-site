import 'server-only'

import { cache } from 'react'
import { isHangingPromiseRejectionError } from 'next/dist/server/dynamic-rendering-utils'
import { Redis } from '@upstash/redis'
import { and, eq, isNotNull, sql } from 'drizzle-orm'
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless'

import {
  authors,
  posts,
  postsToRestaurants,
  restaurant,
  type SelectRestaurant,
} from './schema'

const redis = Redis.fromEnv()

const CACHE_TTL = {
  AUTHORS: 3600,
  POSTS: 3600,
  RESTAURANTS: 3600, // 1小时
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

export const db = drizzleHttp(connectionString)
export const dbServerless = drizzleServerless(connectionString)

export const getRestaurants = cache(async (all = false) => {
  const cacheKey = `restaurants:${all ? 'all' : 'filtered'}`

  try {
    const cachedRestaurants = await redis.get<SelectRestaurant[]>(cacheKey)
    if (cachedRestaurants) return cachedRestaurants

    const restaurants = await db
      .select()
      .from(restaurant)
      .where(
        all
          ? undefined
          : and(
              eq(restaurant.invisible, false),
              isNotNull(restaurant.ai_summarize),
            ),
      )

    if (restaurants.length > 0) {
      await redis.set(cacheKey, restaurants, { ex: CACHE_TTL.RESTAURANTS })
    }

    return restaurants
  } catch (error) {
    if (
      isHangingPromiseRejectionError(
        (error as { cause: { sourceError: unknown } }).cause.sourceError,
      )
    )
      throw error

    console.error('Failed to get restaurants from database')
    throw error
  }
})

export async function updateYoutubeLinkById({
  link,
  id,
}: {
  link: string
  id: string
}) {
  try {
    await db
      .update(restaurant)
      .set({ youtube: link, status: 'pending' })
      .where(eq(restaurant.id, id))

    await Promise.all([
      redis.del(`restaurant:id:${id}`),
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])
  } catch (error) {
    console.error('Failed to update link in database')
    throw error
  }
}

export async function updateStatusById({
  id,
  status,
}: {
  id: string
  status: SelectRestaurant['status']
}) {
  try {
    await db.update(restaurant).set({ status }).where(eq(restaurant.id, id))

    await Promise.all([
      redis.del(`restaurant:id:${id}`),
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])
  } catch (error) {
    console.error('Failed to update status in database')
    throw error
  }
}

export async function cleanRestaurantCacheById(id: SelectRestaurant['id']) {
  try {
    await Promise.all([
      redis.del(`restaurant:id:${id}`),
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])
  } catch (error) {
    console.error('Failed to clean restaurant cache by id')
    throw error
  }
}

export async function getRestaurantById(id: string) {
  const cacheKey = `restaurant:id:${id}`

  try {
    const cachedRestaurant = await redis.get<SelectRestaurant>(cacheKey)
    if (cachedRestaurant) return cachedRestaurant

    const [item] = await db
      .select()
      .from(restaurant)
      .where(eq(restaurant.id, id))
      .limit(1)

    if (item) {
      await redis.set(cacheKey, item, { ex: CACHE_TTL.RESTAURANTS })
    }

    return item
  } catch (error) {
    console.error('Failed to get restaurant by id from database')
    throw error
  }
}

export async function getRestaurantWithPostsByName(name: string) {
  const cacheKey = `restaurant:name:${name}`

  try {
    const cachedRestaurant = await redis.get<typeof item>(cacheKey)
    if (cachedRestaurant) return cachedRestaurant

    const [item] = await db
      .select({
        restaurant: restaurant,
        posts: posts,
      })
      .from(restaurant)
      .leftJoin(
        postsToRestaurants,
        eq(restaurant.id, postsToRestaurants.restaurantId),
      )
      .leftJoin(posts, eq(postsToRestaurants.postId, posts.id))
      .where(sql`${restaurant.ai_summarize}->>'restaurantName' = ${name}`)
      .limit(1)

    if (item) {
      await redis.set(cacheKey, item, { ex: CACHE_TTL.RESTAURANTS })
    }

    return item
  } catch (error) {
    console.error('Failed to get restaurant by name from database')
    throw error
  }
}

export async function updateLocationById({
  location,
  id,
}: {
  location: [number, number]
  id: string
}) {
  try {
    await db.update(restaurant).set({ location }).where(eq(restaurant.id, id))

    await Promise.all([
      redis.del(`restaurant:id:${id}`),
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])
  } catch (error) {
    console.error('Failed to update location in database')
    throw error
  }
}

export async function updateInvisibleById({
  id,
  invisible,
}: {
  id: string
  invisible: boolean
}) {
  try {
    await db.update(restaurant).set({ invisible }).where(eq(restaurant.id, id))

    await Promise.all([
      redis.del(`restaurant:id:${id}`),
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])
  } catch (error) {
    console.error('Failed to update invisible in database')
    throw error
  }
}

export async function linkPostToNewRestaurantByPostId({
  postId,
  data,
}: {
  postId: number
  data: typeof restaurant.$inferInsert
}) {
  try {
    const newRestaurant = await dbServerless.transaction(async (tx) => {
      const [newRestaurant] = await tx
        .insert(restaurant)
        .values(data)
        .returning()

      await tx
        .insert(postsToRestaurants)
        .values({ postId, restaurantId: newRestaurant.id })

      return newRestaurant
    })
    await Promise.all([
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])

    return newRestaurant
  } catch (error) {
    console.error('Failed to link post to new restaurant in database')
    throw error
  }
}

export async function insertPostsToRestaurants({
  postId,
  restaurantId,
}: {
  postId: number
  restaurantId: string
}) {
  try {
    return await db
      .insert(postsToRestaurants)
      .values({ postId, restaurantId })
      .returning()
  } catch (error) {
    console.error('Failed to insert post to restaurant in database')
    throw error
  }
}

export async function insertAuthor({
  platform,
  platformId,
}: Pick<Required<typeof authors.$inferInsert>, 'platform' | 'platformId'>) {
  try {
    await db.insert(authors).values({ platform, platformId })
  } catch (error) {
    console.error('Failed to insert author in database')
    throw error
  }
}

export async function getAuthors() {
  try {
    return await db.select().from(authors)
  } catch (error) {
    if (
      isHangingPromiseRejectionError(
        (error as { cause: { sourceError: unknown } }).cause.sourceError,
      )
    )
      throw error

    console.error('Failed to get authors from database')
    throw error
  }
}

export async function getPosts() {
  try {
    return await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        metadata: posts.metadata,
        created_at: posts.created_at,
        updated_at: posts.updated_at,
        postsToRestaurants: postsToRestaurants,
      })
      .from(posts)
      .leftJoin(postsToRestaurants, eq(posts.id, postsToRestaurants.postId))
  } catch (error) {
    if (
      isHangingPromiseRejectionError(
        (error as { cause: { sourceError: unknown } }).cause.sourceError,
      )
    )
      throw error

    console.error('Failed to get posts from database')
    throw error
  }
}
