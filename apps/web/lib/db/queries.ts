import 'server-only'

import { cache } from 'react'
import { Redis } from '@upstash/redis'
import { and, eq, isNotNull } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { restaurant, SelectRestaurant } from './schema'

const redis = Redis.fromEnv()

const CACHE_TTL = {
  RESTAURANTS: 3600, // 1小时
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

export const db = drizzle(connectionString)

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
    console.log(error)
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

export async function updateAISummarize({
  ai_summarize,
  id,
}: NonNullable<Pick<SelectRestaurant, 'ai_summarize' | 'id'>>) {
  try {
    await db
      .update(restaurant)
      .set({ ai_summarize, updated_at: new Date(), status: 'success' })
      .where(eq(restaurant.id, id))

    await Promise.all([
      redis.del(`restaurant:id:${id}`),
      redis.del('restaurants:filtered'),
      redis.del('restaurants:all'),
    ])
  } catch (error) {
    console.error('Failed to update ai_summarize in database')
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
