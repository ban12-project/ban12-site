'use server';

import coordtransform from 'coordtransform';
import { cacheTag } from 'next/cache';

import {
  getRestaurantById,
  getRestaurants,
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

export type FollowUpRestaurant = {
  id: string;
  href: string;
  name: string;
  address: string;
  rating: number | null;
  price: string | null;
  waitingTime: string | null;
  dishes: string | null;
  coordinates: [number, number];
  searchText: string;
};

export async function getFollowUpRestaurants() {
  'use cache';
  cacheTag('restaurants', 'restaurants:filtered', 'restaurants:follow-up');

  const restaurants = await getRestaurants();

  return restaurants.flatMap<FollowUpRestaurant>((restaurant) => {
    if (!restaurant.location || !restaurant.ai_summarize) return [];

    const summary = restaurant.ai_summarize;
    const coordinates = coordtransform.gcj02towgs84(...restaurant.location) as [
      number,
      number,
    ];
    const name = summary.restaurantName;
    const address = summary.restaurantAddress;

    return {
      id: restaurant.id,
      href: `/follow-up/${encodeURIComponent(name)}`,
      name,
      address,
      rating: summary.rating ?? null,
      price: summary.price || null,
      waitingTime: summary.waitingTime || null,
      dishes: summary.dishes || null,
      coordinates,
      searchText: [name, address, summary.dishes, summary.service]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    };
  });
}
