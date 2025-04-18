import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Skeleton } from '@repo/ui/components/skeleton'

import {
  getCollectionById,
  getCollectionByIdWithAlbumsAndShortcuts,
} from '#/lib/db/queries'
import { getDictionary, Messages, type Locale } from '#/lib/i18n'
import AlbumList from '#/components/album-list'
import AlbumListSkeleton from '#/components/album-list-skeleton'
import ShortcutList from '#/components/shortcut-list'

type CollectionsProps = {
  params: Promise<{ id: string; lang: Locale }>
}

const preload = (id: number) => {
  void getCollectionByIdWithAlbumsAndShortcuts(id)
}

export default async function CollectionsPage({ params }: CollectionsProps) {
  const { id, lang } = await params
  const NumericId = Number.parseInt(id)
  preload(NumericId)
  const messages = await getDictionary(lang)

  return (
    <main>
      <Suspense
        fallback={
          <>
            <div className="container-full pt-safe-max-4 pb-5">
              <Skeleton className="h-9 w-full" />
            </div>
            <div>
              <AlbumListSkeleton num={3} />
            </div>
          </>
        }
      >
        <Collections lang={lang} messages={messages} id={NumericId} />
      </Suspense>
    </main>
  )
}

async function Collections({
  lang,
  messages,
  id,
}: {
  lang: Locale
  messages: Messages
  id: number
}) {
  const collection = await getCollectionByIdWithAlbumsAndShortcuts(id)

  if (!collection) notFound()

  return (
    <>
      <div className="container-full pt-safe-max-4 pb-5">
        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
          {collection.title[lang]}
        </h1>
      </div>
      <AlbumList lang={lang} albums={collection.albums} messages={messages} />

      <div className="container-full">
        <ShortcutList lang={lang} shortcuts={collection.shortcuts} />
      </div>
    </>
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
