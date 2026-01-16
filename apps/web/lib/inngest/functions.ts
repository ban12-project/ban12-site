import { revalidatePath, revalidateTag } from 'next/cache';
import { cleanRestaurantCacheById } from '#/lib/db/queries';
import { inngest } from './client';

export const triggerRevalidation = inngest.createFunction(
  { id: 'trigger-revalidation' },
  { event: 'web/revalidation.trigger' },
  async ({ event, step }) => {
    const { id } = event.data;

    step.run('1. Clean restaurant redis cache', async () => {
      await cleanRestaurantCacheById(id);
    });

    step.run('2. Trigger revalidation for restaurant', async () => {
      const tags = [`restaurant:${id}`];
      const paths = [
        { path: '/[lang]/dashboard/restaurants', type: 'page' },
      ] as const;

      if (paths && paths.length > 0) {
        paths.forEach(({ path, type }) => {
          revalidatePath(path, type);
        });
      }

      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          revalidateTag(tag, { expire: 0 });
        });
      }

      return {
        revalidated: true,
        now: Date.now(),
        paths,
        tags,
      };
    });
  },
);
