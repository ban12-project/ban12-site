import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAlbumById, getAlbumByIdWithShortcuts } from '#/lib/db/queries'
import type { Locale } from '#/lib/i18n'
import ShortcutList from '#/components/shortcut-list'

type ListPageProps = {
  params: Promise<{ id: string; lang: Locale }>
}

export default async function ListPage({ params }: ListPageProps) {
  const { id, lang } = await params
  const album = await getAlbumByIdWithShortcuts(Number.parseInt(id))

  if (!album) notFound()

  return (
    <main className="container-full pt-safe-max-4">
      <h2 className="text-3xl font-bold">{album.title[lang]}</h2>
      <ShortcutList lang={lang} shortcuts={album.shortcuts} />
    </main>
  )
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const { id, lang } = await params
  const album = await getAlbumById(Number.parseInt(id))

  if (!album) notFound()

  return {
    title: album.title[lang],
    description: album.description[lang],
  }
}
