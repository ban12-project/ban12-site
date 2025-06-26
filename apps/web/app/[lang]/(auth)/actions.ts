'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { GoogleGenAI, Type } from '@google/genai'
import { z } from 'zod'

import {
  updateAISummarize,
  updateInvisibleById,
  updateLocationById,
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
  try {
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
      throw new Error('No response text')
    }

    await updateAISummarize({
      ai_summarize: JSON.parse(response.text),
      id,
    })
  } catch (error) {
    await updateStatusById({ id, status: 'failed' })
    throw error
  }

  revalidatePath('/[lang]/dashboard', 'page')
  revalidateTag(`restaurant:${id}`)
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

  revalidatePath('/[lang]/dashboard', 'page')

  return {
    message: 'success',
  }
}

const locationSchema = z.object({
  location: z.tuple([z.number(), z.number()]),
  id: z.string().nonempty(),
})

export async function updateLocation(prevState: State, formData: FormData) {
  const lng = formData.get('location.0')
  const lat = formData.get('location.1')

  const validatedFields = locationSchema.safeParse({
    location: [lng ? Number(lng) : undefined, lat ? Number(lat) : undefined],
    id: formData.get('id'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const { location, id } = validatedFields.data

  try {
    await updateLocationById({ location, id })
  } catch {
    return {
      message: 'Failed to update youtube link.',
    }
  }

  revalidatePath('/[lang]/dashboard', 'page')
  revalidateTag(`restaurant:${id}`)

  return {
    message: 'success',
  }
}

const InvisibleSchema = z.object({
  id: z.string().nonempty(),
  invisible: z.boolean(),
})

export async function updateInvisible(prevState: State, formData: FormData) {
  const validatedFields = InvisibleSchema.safeParse({
    id: formData.get('id'),
    invisible: formData.get('invisible') === 'true',
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const { invisible, id } = validatedFields.data

  try {
    await updateInvisibleById({ invisible, id })
  } catch {
    return {
      message: 'Failed to update youtube link.',
    }
  }

  revalidatePath('/[lang]/dashboard', 'page')
  revalidateTag(`restaurant:${id}`)

  return {
    message: 'success',
  }
}
