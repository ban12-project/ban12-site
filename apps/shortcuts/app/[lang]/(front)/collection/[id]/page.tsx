import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  getCollectionById,
  getCollectionByIdWithAlbumsAndShortcuts,
} from '#/lib/db/queries'
import { getDictionary, type Locale } from '#/lib/i18n'
import AlbumList from '#/components/album-list'
import ShortcutList from '#/components/shortcut-list'

type CollectionsProps = {
  params: Promise<{ id: string; lang: Locale }>
}

export const runtime = 'edge'

export default async function Collections({ params }: CollectionsProps) {
  const { id, lang } = await params
  const [messages, collection] = await Promise.all([
    getDictionary(lang),
    getCollectionByIdWithAlbumsAndShortcuts(Number.parseInt(id)),
  ])

  if (!collection) notFound()

  return (
    <main>
      <div className="container-full pt-safe-max-4 pb-5">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
          {collection.title[lang]}
        </h1>
      </div>
      <AlbumList lang={lang} albums={collection.albums} messages={messages} />

      <div className="container-full">
        <ShortcutList lang={lang} shortcuts={collection.shortcuts} />
      </div>
    </main>
  )
}

export async function generateMetadata({
  params,
}: CollectionsProps): Promise<Metadata> {
  const { id, lang } = await params
  const collection = await getCollectionById(Number.parseInt(id))

  if (!collection) notFound()

  return {
    title: collection.title[lang],
    description: collection.title[lang],
  }
}
