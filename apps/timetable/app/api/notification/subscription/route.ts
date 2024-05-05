import { revalidatePath } from 'next/cache'

import prisma from '#/lib/prisma'

export async function POST(request: Request) {
  const res = await request.json()

  if (!res || !res.endpoint) {
    return new Response(
      JSON.stringify({
        error: {
          id: 'no-endpoint',
          message: 'Subscription must have an endpoint.',
        },
      }),
      { status: 400 },
    )
  }

  try {
    const subscription = await prisma.pushSubscription.create({
      data: {
        subscription: res,
      },
    })

    revalidatePath('/trigger-push-msg')

    return new Response(JSON.stringify({ subscription }))
  } catch {
    return new Response(
      JSON.stringify({
        error: {
          id: 'unable-to-save-subscription',
          message:
            'The subscription was received but we were unable to save it to our database.',
        },
      }),
    )
  }
}
