import { type NextRequest } from 'next/server'

import OpengraphImage from '#/components/opengraph-image'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title') || undefined
  const width = Number(searchParams.get('w')) || undefined // ignore number 0
  const height = Number(searchParams.get('h')) || undefined
  const backgroundColor = searchParams.get('bg') || undefined
  const textColor = searchParams.getAll('txt')
  const sizeFit = searchParams.get('size-fit') || undefined

  const response = await OpengraphImage({
    title,
    width,
    height,
    backgroundColor,
    textColor,
    sizeFit,
  })
  response.headers.set(
    'Cache-Control',
    'public, immutable, no-transform, max-age=31536000',
  )
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')

  return response
}
