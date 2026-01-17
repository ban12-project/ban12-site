import 'server-only';

import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import { cacheTag, revalidateTag } from 'next/cache';
import { isHangingPromiseRejectionError } from 'next/dist/server/dynamic-rendering-utils';

import {
  authors,
  posts,
  postsToRestaurants,
  restaurant,
  type SelectRestaurant,
} from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Not valid database url');

export const db = drizzleHttp(connectionString);
export const dbServerless = drizzleServerless(connectionString);

export async function getRestaurants(all = false) {
  'use cache';
  cacheTag('restaurants', all ? 'restaurants:all' : 'restaurants:filtered');

  try {
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
      );

    return restaurants;
  } catch (error) {
    if (
      isHangingPromiseRejectionError(
        (error as { cause: { sourceError: unknown } }).cause.sourceError,
      )
    )
      throw error;

    console.error('Failed to get restaurants from database');
    throw error;
  }
}

export async function updateYoutubeLinkById({
  link,
  id,
}: {
  link: string;
  id: string;
}) {
  try {
    await db
      .update(restaurant)
      .set({ youtube: link, status: 'pending' })
      .where(eq(restaurant.id, id));

    revalidateTag(`restaurant:id:${id}`, { expire: 0 });
    revalidateTag('restaurants:filtered', { expire: 0 });
    revalidateTag('restaurants:all', { expire: 0 });
  } catch (error) {
    console.error('Failed to update link in database');
    throw error;
  }
}

export async function updateStatusById({
  id,
  status,
}: {
  id: string;
  status: SelectRestaurant['status'];
}) {
  try {
    await db.update(restaurant).set({ status }).where(eq(restaurant.id, id));

    revalidateTag(`restaurant:id:${id}`, { expire: 0 });
    revalidateTag('restaurants:filtered', { expire: 0 });
    revalidateTag('restaurants:all', { expire: 0 });
  } catch (error) {
    console.error('Failed to update status in database');
    throw error;
  }
}

export async function cleanRestaurantCacheById(id: SelectRestaurant['id']) {
  try {
    revalidateTag(`restaurant:id:${id}`, { expire: 0 });
    revalidateTag('restaurants:filtered', { expire: 0 });
    revalidateTag('restaurants:all', { expire: 0 });
  } catch (error) {
    console.error('Failed to clean restaurant cache by id');
    throw error;
  }
}

export async function getRestaurantById(id: string) {
  'use cache';
  cacheTag(`restaurant:id:${id}`);

  try {
    const [item] = await db
      .select()
      .from(restaurant)
      .where(eq(restaurant.id, id))
      .limit(1);

    return item;
  } catch (error) {
    console.error('Failed to get restaurant by id from database');
    throw error;
  }
}

export async function getRestaurantWithPostsByName(name: string) {
  'use cache';
  cacheTag(`restaurant:name:${name}`);

  try {
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
      .limit(1);

    return item;
  } catch (error) {
    console.error('Failed to get restaurant by name from database');
    throw error;
  }
}

export async function updateLocationById({
  location,
  id,
}: {
  location: [number, number];
  id: string;
}) {
  try {
    await db.update(restaurant).set({ location }).where(eq(restaurant.id, id));

    revalidateTag(`restaurant:id:${id}`, { expire: 0 });
    revalidateTag('restaurants:filtered', { expire: 0 });
    revalidateTag('restaurants:all', { expire: 0 });
  } catch (error) {
    console.error('Failed to update location in database');
    throw error;
  }
}

export async function updateInvisibleById({
  id,
  invisible,
}: {
  id: string;
  invisible: boolean;
}) {
  try {
    await db.update(restaurant).set({ invisible }).where(eq(restaurant.id, id));

    revalidateTag(`restaurant:id:${id}`, { expire: 0 });
    revalidateTag('restaurants:filtered', { expire: 0 });
    revalidateTag('restaurants:all', { expire: 0 });
  } catch (error) {
    console.error('Failed to update invisible in database');
    throw error;
  }
}

export async function linkPostToNewRestaurantByPostId({
  postId,
  data,
}: {
  postId: number;
  data: typeof restaurant.$inferInsert;
}) {
  try {
    const newRestaurant = await dbServerless.transaction(async (tx) => {
      const [newRestaurant] = await tx
        .insert(restaurant)
        .values(data)
        .returning();

      await tx
        .insert(postsToRestaurants)
        .values({ postId, restaurantId: newRestaurant.id });

      return newRestaurant;
    });

    revalidateTag('restaurants:filtered', { expire: 0 });
    revalidateTag('restaurants:all', { expire: 0 });

    return newRestaurant;
  } catch (error) {
    console.error('Failed to link post to new restaurant in database');
    throw error;
  }
}

export async function insertPostsToRestaurants({
  postId,
  restaurantId,
}: {
  postId: number;
  restaurantId: string;
}) {
  try {
    return await db
      .insert(postsToRestaurants)
      .values({ postId, restaurantId })
      .returning();
  } catch (error) {
    console.error('Failed to insert post to restaurant in database');
    throw error;
  }
}

export async function insertAuthor({
  platform,
  platformId,
}: Pick<Required<typeof authors.$inferInsert>, 'platform' | 'platformId'>) {
  try {
    await db.insert(authors).values({ platform, platformId });
  } catch (error) {
    console.error('Failed to insert author in database');
    throw error;
  }
}

export async function getAuthors() {
  'use cache';
  cacheTag('authors');

  try {
    return await db.select().from(authors);
  } catch (error) {
    if (
      isHangingPromiseRejectionError(
        (error as { cause: { sourceError: unknown } }).cause.sourceError,
      )
    )
      throw error;

    console.error('Failed to get authors from database');
    throw error;
  }
}

export async function getPosts() {
  'use cache';
  cacheTag('posts');

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
      .leftJoin(postsToRestaurants, eq(posts.id, postsToRestaurants.postId));
  } catch (error) {
    if (
      isHangingPromiseRejectionError(
        (error as { cause: { sourceError: unknown } }).cause.sourceError,
      )
    )
      throw error;

    console.error('Failed to get posts from database');
    throw error;
  }
}
