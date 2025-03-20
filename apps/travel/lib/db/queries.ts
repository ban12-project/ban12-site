import { unstable_cache } from 'next/cache'
import { drizzle } from 'drizzle-orm/neon-http'

import { gangchelin } from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('Not valid database url')

const db = drizzle(connectionString)

export const getRestaurants = unstable_cache(
  async () => {
    try {
      const restaurants = await db.select().from(gangchelin)
      return restaurants
    } catch (error) {
      console.error('Failed to get restaurants from database')
      throw error
    }
  },
  ['restaurants'],
  { revalidate: 3600 * 24 },
)
