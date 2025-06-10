'use server'

import { revalidateTag } from 'next/cache'
import { GoogleGenAI, Type } from '@google/genai'
import { z } from 'zod'

import {
  updateAISummarize,
  updateStatusById,
  updateYoutubeLinkById,
} from '#/lib/db/queries'

export async function videoUnderstanding({
  fileUri,
  id,
}: {
  fileUri: string
  id: string
}) {
  await updateStatusById({ id, status: 'processing' })

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY })
  const response = await ai.models.generateContent({
    model: process.env.GOOGLE_GEMINI_MODEL!,
    contents: [
      {
        fileData: {
          fileUri,
        },
      },
      "Based on the video description, provide the restaurant's name and restaurant's address, give a recommendation rating (out of five points) in terms of price, waiting time, dishes, and service, and offer precautions for diners visiting this place",
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          restaurantName: {
            type: Type.STRING,
          },
          restaurantAddress: {
            type: Type.STRING,
          },
          rating: {
            type: Type.NUMBER,
          },
          price: {
            type: Type.STRING,
          },
          waitingTime: {
            type: Type.STRING,
          },
          dishes: {
            type: Type.STRING,
          },
          service: {
            type: Type.STRING,
          },
          precautions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
            },
          },
        },
        propertyOrdering: [
          'restaurantName',
          'restaurantAddress',
          'rating',
          'price',
          'waitingTime',
          'dishes',
          'service',
          'precautions',
        ],
      },
    },
  })

  if (!response.text) {
    await updateStatusById({ id, status: 'failed' })
    return
  }
  try {
    await updateAISummarize({
      ai_summarize: JSON.parse(response.text),
      id,
    })
  } catch {
    await updateStatusById({ id, status: 'failed' })
  }
}

export type State = {
  errors?: {
    [key: string]: string[] | undefined
  }
  message?: string | null
}

const updateYoutubeFormSchema = z.object({
  link: z.string().url().startsWith('https://www.youtube.com/watch?v='),
  id: z.string().nonempty(),
})

export async function updateYoutubeLink(prevState: State, formData: FormData) {
  const validatedFields = updateYoutubeFormSchema.safeParse({
    link: formData.get('link'),
    id: formData.get('id'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const { link, id } = validatedFields.data

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
