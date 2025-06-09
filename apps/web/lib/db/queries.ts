import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'

import { restaurant } from './schema'

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
      .where(eq(restaurant.bvid, id))
  } catch (error) {
    console.error('Failed to update link in database')
    throw error
  }
}
