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

export default async function Collections(props: CollectionsProps) {
  const params = await props.params
  const [messages, collection] = await Promise.all([
    getDictionary(params.lang),
    getCollectionByIdWithAlbumsAndShortcuts(Number.parseInt(params.id)),
  ])

  if (!collection) notFound()

  return (
    <main>
      <div className="container-full pt-safe-max-4 pb-5">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
          {collection.title}
        </h1>
      </div>
      <AlbumList albums={collection.albums} messages={messages} />

      <div className="container-full">
        <ShortcutList shortcuts={collection.shortcuts} />
      </div>
    </main>
  )
}

export async function generateMetadata(
  props: CollectionsProps,
): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionById(Number.parseInt(params.id))

  if (!collection) notFound()

  return {
    title: collection.title,
    description: collection.title,
  }
}
