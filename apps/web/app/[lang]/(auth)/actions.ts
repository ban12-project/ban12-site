'use server'

import { revalidateTag } from 'next/cache'
import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

import { updateYoutubeLinkById } from '#/lib/db/queries'

export async function videoUnderstanding(fileUri: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY })
  const response = await ai.models.generateContent({
    model: process.env.GOOGLE_GEMINI_MODEL!,
    contents: [
      {
        fileData: {
          fileUri,
        },
      },
      '根据视频描述出餐馆地址，从价格、等待时间、菜品、服务等方面给出推荐指数，并给来此地的食客提供注意事项',
    ],
  })

  return response.text
}

export type State = {
  errors?: {
    [key: string]: string[] | undefined
  }
  message?: string | null
}

const updateYoutubeFormSchema = z.object({
  link: z.string().url().startsWith('https://www.youtube.com/watch?v='),
  bvid: z.string().nonempty(),
})

export async function updateYoutubeLink(prevState: State, formData: FormData) {
  const validatedFields = updateYoutubeFormSchema.safeParse({
    link: formData.get('link'),
    bvid: formData.get('bvid'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const { link, bvid: id } = validatedFields.data

  try {
    await updateYoutubeLinkById({ link, id })
  } catch {
    return {
      message: 'Failed to update youtube link.',
    }
  }

  revalidateTag('restaurants')
  return {
    message: 'success',
  }
}
