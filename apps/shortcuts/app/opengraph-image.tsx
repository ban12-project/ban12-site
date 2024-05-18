import type { Metadata } from 'next'

import OpengraphImage from '#/components/opengraph-image'

export const runtime = 'edge'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
}

export default async function Image() {
  return await OpengraphImage()
}
