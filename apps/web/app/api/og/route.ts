import { type NextRequest } from 'next/server'

import OpengraphImage from '#/components/opengraph-image'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title') || undefined
  const width = Number(searchParams.get('w')) || undefined // ignore number 0
  const height = Number(searchParams.get('h')) || undefined
  const backgroundColor = searchParams.get('bg') || undefined

  const response = await OpengraphImage({
    title,
    width,
    height,
    backgroundColor,
  })
  response.headers.set(
    'Cache-Control',
    'public, immutable, no-transform, max-age=31536000',
  )

  return response
}
