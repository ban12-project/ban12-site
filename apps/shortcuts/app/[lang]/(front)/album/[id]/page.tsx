import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '#/drizzle/db'
import type { Locale } from '#/i18n'

import ShortcutList from '#/components/ui/shortcut-list'

type ListPageProps = {
  params: { id: string; lang: Locale }
}

export default async function ListPage({ params }: ListPageProps) {
  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.id, Number.parseInt(params.id)),
    with: {
      shortcuts: true,
    },
  })

  if (!album) notFound()

  return (
    <main className="container-full pt-safe-max-4">
      <h2 className="text-3xl font-bold">{album.title}</h2>
      <ShortcutList shortcuts={album.shortcuts} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.id, Number.parseInt(params.id)),
  })

  if (!album) notFound()

  return {
    title: album.title,
    description: album.description,
  }
}
