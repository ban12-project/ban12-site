'use server'

import { unstable_cacheTag as cacheTag } from 'next/cache'

import { getRestaurantById, getRestaurantByName } from '#/lib/db/queries'

export async function getCachedRestaurantById(id: string) {
  'use cache'
  cacheTag(`restaurant:${id}`)

  const restaurant = await getRestaurantById(id)
  return restaurant
}

export async function getCachedRestaurantByName(name: string) {
  'use cache'
  cacheTag(`restaurant:${name}`)

  const restaurant = await getRestaurantByName(decodeURIComponent(name))
  return restaurant
}
