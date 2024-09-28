import { type NextRequest } from 'next/server'

import OpengraphImage from '#/components/opengraph-image'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title')

  const response = await OpengraphImage({ title })
  response.headers.set(
    'Cache-Control',
    'public, immutable, no-transform, max-age=31536000',
  )

  return response
}
