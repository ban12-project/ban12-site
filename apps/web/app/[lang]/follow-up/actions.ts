'use server'

import { unstable_cacheTag as cacheTag } from 'next/cache'

import { getRestaurantById, getRestaurants } from '#/lib/db/queries'

export async function getCachedRestaurantById(id: string) {
  'use cache'
  cacheTag(`restaurant:${id}`)

  const restaurant = await getRestaurantById(id)
  return restaurant
}

export async function getCachedRestaurants() {
  'use cache'

  const restaurants = await getRestaurants()
  return restaurants
}
