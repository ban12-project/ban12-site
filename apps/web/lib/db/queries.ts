import 'server-only'

import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { restaurant, SelectRestaurant } from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

export const db = drizzle(connectionString)

export const getRestaurants = cache(async () => {
  try {
    const restaurants = await db.select().from(restaurant)
    return restaurants
  } catch (error) {
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
  } catch (error) {
    console.error('Failed to update link in database')
    throw error
  }

  revalidatePath('/dashboard')
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
  } catch (error) {
    console.error('Failed to update status in database')
    throw error
  }

  revalidatePath('/dashboard')
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
  } catch (error) {
    console.error('Failed to update ai_summarize in database')
    throw error
  }

  revalidatePath('/dashboard')
}

export async function getRestaurantById(id: string) {
  try {
    const [item] = await db
      .select()
      .from(restaurant)
      .where(eq(restaurant.id, id))
      .limit(1)
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
  } catch (error) {
    console.error('Failed to update location in database')
    throw error
  }

  revalidatePath('/dashboard')
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
  } catch (error) {
    console.error('Failed to update invisible in database')
    throw error
  }
}
