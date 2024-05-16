import { notFound } from 'next/navigation'

import { fetchShortcutByID } from '#/lib/actions'
import OpengraphImage from '#/components/opengraph-image'

export const runtime = 'edge'

export default async function Image({ params }: { params: { id: string } }) {
  const shortcut = await fetchShortcutByID(params.id)

  if (!shortcut) notFound()

  return await OpengraphImage({ title: shortcut.name })
}
