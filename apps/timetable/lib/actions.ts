'use server'

import { revalidatePath } from 'next/cache'
import webPush from 'web-push'

import prisma from './prisma'

export async function notification(
  prevState: string | undefined,
  formData: FormData,
) {
  if (
    !process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY ||
    !process.env.WEB_PUSH_EMAIL ||
    !process.env.WEB_PUSH_PRIVATE_KEY
  ) {
    throw new Error('Environment variables supplied not sufficient.')
  }

  const { id, title, body } = {
    id: formData.get('id'),
    title: formData.get('title'),
    body: formData.get('body'),
  }

  if (!id) return 'Missing id'

  const result = await prisma.pushSubscription.findUnique({
    where: {
      id: Number.parseInt(id as string),
    },
  })

  if (!result) {
    return 'No subscription found'
  }

  try {
    webPush.setVapidDetails(
      `mailto:${process.env.WEB_PUSH_EMAIL}`,
      process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY,
      process.env.WEB_PUSH_PRIVATE_KEY,
    )
    const response = await webPush.sendNotification(
      result.subscription as unknown as webPush.PushSubscription,
      JSON.stringify({
        title,
        body,
      }),
    )
    return response.body
  } catch (err) {
    if (err instanceof webPush.WebPushError) {
      return err.body
    }
    console.log(err)
    return 'Internal Server Error'
  }
}

export async function deleteSubscription(formData: FormData) {
  const id = formData.get('id')
  if (!id) return

  await prisma.pushSubscription.delete({
    where: {
      id: Number.parseInt(id as string),
    },
  })

  revalidatePath('/trigger-push-msg')
}
