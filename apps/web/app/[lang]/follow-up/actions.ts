'use server';

import { cacheTag } from 'next/cache';

import {
  getRestaurantById,
  getRestaurantWithPostsByName,
} from '#/lib/db/queries';

export async function getCachedRestaurantById(id: string) {
  'use cache';
  cacheTag(`restaurant:${id}`);

  const restaurant = await getRestaurantById(id);
  return restaurant;
}

export async function getCachedRestaurantWithPostsByName(name: string) {
  'use cache';
  cacheTag(`restaurant:${name}`);

  const restaurant = await getRestaurantWithPostsByName(
    decodeURIComponent(name),
  );
  return restaurant;
}

export type RestaurantWithPosts = Awaited<
  ReturnType<typeof getCachedRestaurantWithPostsByName>
>;
