import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
  Type,
} from '@google/genai'

import { updateAISummarize, updateStatusById } from '#/lib/db/queries'

import { inngest } from './client'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_KEY })

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    await step.sleep('wait-a-moment', '1s')
    return { message: `Hello ${event.data.email}!` }
  },
)

async function triggerRevalidation(id: string) {
  // Construct the full URL for the callback
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
}

export const videoUnderstanding = inngest.createFunction(
  { id: 'video-understanding', concurrency: 5 },
  { event: 'video/understanding' },
  async ({ event, step }) => {
    const { id, fileUri, part } = event.data

    const invalidPart =
      typeof part !== 'object' ||
      typeof part.uri !== 'string' ||
      typeof part.mimeType !== 'string'
    if ((!fileUri && invalidPart) || !id) {
      return { message: `Invalid input: ${JSON.stringify(event.data)}` }
    }

    const text = await step.run(
      '1. Call Gemini for video understanding',
      async () => {
        const response = await ai.models.generateContent({
          model: process.env.GOOGLE_GEMINI_MODEL!,
          contents: createUserContent([
            part
              ? createPartFromUri(part.uri, part.mimeType)
              : {
                  fileData: {
                    fileUri,
                  },
                },
            "Based on the video description, provide the restaurant's name and restaurant's address, give a recommendation rating (out of five points) in terms of price, waiting time, dishes, and service, and offer precautions for diners visiting this place, with all fields in Chinese.",
          ]),
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
        return response.text
      },
    )

    if (!text) {
      await step.run('2a. Update status to failed', async () => {
        await updateStatusById({ id, status: 'failed' })
      })
      await step.run('2b. Trigger revalidation for failure', async () => {
        return await triggerRevalidation(id)
      })
      return { message: 'No response text' }
    }

    await step.run(
      '2. Update database with AI summary and success status',
      async () => {
        await updateAISummarize({
          ai_summarize: JSON.parse(text),
          id,
        })
        await updateStatusById({ id, status: 'success' })
      },
    )

    await step.run('3. Trigger revalidation for success', async () => {
      return await triggerRevalidation(id)
    })

    return {
      success: true,
      message: `Successfully processed and revalidated video for id: ${id}`,
    }
  },
)
