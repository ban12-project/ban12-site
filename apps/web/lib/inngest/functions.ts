import { cleanRestaurantCacheById } from '#/lib/db/queries'

import { inngest } from './client'

export const triggerRevalidation = inngest.createFunction(
  { id: 'trigger-revalidation' },
  { event: 'web/revalidation.trigger' },
  async ({ event, step }) => {
    const { id } = event.data

    step.run('1. Clean restaurant redis cache', async () => {
      await cleanRestaurantCacheById(id)
    })

    step.run('2. Trigger revalidation for restaurant', async () => {
      const revalidateUrl = new URL(
        '/api/revalidate',
        process.env.NEXT_PUBLIC_HOST_URL!,
      )

      const response = await fetch(revalidateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.REVALIDATE_TOKEN!,
        },
        body: JSON.stringify({
          tags: [`restaurant:${id}`],
          paths: [{ path: '/[lang]/dashboard/restaurants', type: 'page' }],
        }),
      })

      if (!response.ok) {
        // Log the error but don't let it fail the entire Inngest job
        console.error(`Failed to revalidate: ${await response.text()}`)
      }

      return await response.json()
    })
  },
)
