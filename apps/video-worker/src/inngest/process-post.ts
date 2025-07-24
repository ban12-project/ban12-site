import { createWriteStream } from 'fs'
import fs from 'fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { GoogleGenAI } from '@google/genai'
import type { Logger } from 'inngest/middleware/logger'

import { sql } from '../db'
import { inngest } from './client'

export default inngest.createFunction(
  { id: 'video-process', concurrency: 3 },
  { event: 'video/process' },
  async ({ event, step, logger }) => {
    const { postId, restaurantId } = event.data

    const post = await step.run(
      `1. Get post by postId: ${postId}`,
      async () => {
        const [post] = await sql<
          {
            postId: number
            metadata: any
            authorId: number
            platform: string
            platformId: string
          }[]
        >`
        SELECT
          p.id as "postId",
          p.metadata,
          a.id as "authorId",
          a.platform,
          a."platformId"
        FROM posts p
        JOIN authors a ON p."authorId" = a.id
        WHERE p.id = ${postId}
      `

        return post
      },
    )

    if (!post) {
      return { message: `Post with id ${postId} not found` }
    }

    await step.run(
      `2. Handle post by ${post.authorId}:${post.platform}:${post.platformId}->${restaurantId}`,
      async () => {
        switch (post.platform) {
          case 'bilibili':
            await bilibiliHandler(
              {
                bvid: post.metadata.bvid,
                restaurantId: restaurantId,
              },
              logger,
            )

            break
          default:
            logger.warn(`Unhandled platform: ${post.platform}`)
        }
      },
    )
  },
)

async function bilibiliHandler(
  {
    bvid,
    restaurantId,
  }: {
    bvid: string
    restaurantId: string
  },
  logger: Logger,
) {
  const response = await fetch(
    new URL(
      `/functions/v1/bilibili-get-video-urls/${bvid}`,
      process.env.SUPABASE_ENDPOINT,
    ),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      method: 'GET',
    },
  )
  if (!response.ok) {
    throw new Error(
      `Failed to fetch video URLs for bvid ${bvid}: ${response.statusText}`,
    )
  }
  const data = await response.json()
  const downloadUrl = data[0].url

  // 使用 downloadUrl 下载文件保存到 /tmp 目录
  const fileName = `${bvid}.mp4`
  const filePath = `/tmp/${fileName}`
  const fileResponse = await fetch(downloadUrl)
  if (!fileResponse.ok) {
    logger.error(
      `Failed to download video for bvid ${bvid}: ${fileResponse.statusText}`,
    )
    return
  }
  if (!fileResponse.body) {
    logger.error(`No response body for video download of bvid ${bvid}`)
    return
  }

  await pipeline(
    Readable.fromWeb(fileResponse.body as any),
    createWriteStream(filePath),
  )
  logger.info(`Video downloaded to ${filePath}`)

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })

  const myfile = await ai.files.upload({
    file: filePath,
    config: { mimeType: 'video/mp4' },
  })
  if (!myfile.uri || !myfile.mimeType) {
    logger.error('Upload failed: No URI or MIME type returned')
    return
  }
  logger.info(
    `File uploaded successfully. URI: ${myfile.uri}, MIME Type: ${myfile.mimeType}`,
  )

  await inngest.send({
    name: 'video/understanding',
    data: {
      id: restaurantId,
      part: { uri: myfile.uri, mimeType: myfile.mimeType },
    },
  })
  logger.info(
    `Inngest event 'video/understand' sent for restaurant ${restaurantId}`,
  )
}
