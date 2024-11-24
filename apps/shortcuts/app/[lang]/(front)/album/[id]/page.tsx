import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAlbumById, getAlbumByIdWithShortcuts } from '#/lib/db/queries'
import type { Locale } from '#/lib/i18n'
import ShortcutList from '#/components/shortcut-list'

type ListPageProps = {
  params: Promise<{ id: string; lang: Locale }>
}

export default async function ListPage(props: ListPageProps) {
  const params = await props.params
  const album = await getAlbumByIdWithShortcuts(Number.parseInt(params.id))

  if (!album) notFound()

  return (
    <main className="container-full pt-safe-max-4">
      <h2 className="text-3xl font-bold">{album.title}</h2>
      <ShortcutList shortcuts={album.shortcuts} />
    </main>
  )
}

export async function generateMetadata(
  props: ListPageProps,
): Promise<Metadata> {
  const params = await props.params
  const album = await getAlbumById(Number.parseInt(params.id))

  if (!album) notFound()

  return {
    title: album.title,
    description: album.description,
  }
}
