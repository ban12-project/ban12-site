import { Suspense } from 'react'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { Skeleton } from '@repo/ui/components/skeleton'

import {
  getCollectionByIdWithAlbumsAndShortcuts,
  getCollections,
} from '#/lib/db/queries'
import { getDictionary, i18n, type Locale, type Messages } from '#/lib/i18n'
import AlbumList from '#/components/album-list'
import AlbumListSkeleton from '#/components/album-list-skeleton'
import ShortcutList from '#/components/shortcut-list'

type CollectionsProps = {
  params: Promise<{ id: string; lang: Locale }>
}

const preload = (id: number) => {
  void getCachedCollectionByIdWithAlbumsAndShortcuts(id)
}

const getCachedCollectionByIdWithAlbumsAndShortcuts = unstable_cache(
  getCollectionByIdWithAlbumsAndShortcuts,
  ['collection', 'album', 'shortcut'],
  {
    tags: ['collection', 'album', 'shortcut'],
  },
)

export async function generateStaticParams() {
  const collections = await getCollections()
  return collections.map((collection) => ({
    id: collection.id.toString(),
  }))
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
  const collection = await getCachedCollectionByIdWithAlbumsAndShortcuts(id)

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
  const collection = await getCachedCollectionByIdWithAlbumsAndShortcuts(
    Number.parseInt(id),
  )

  if (!collection) notFound()

  return {
    title: collection.title[lang],
    description: collection.title[lang],
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: `/collection/${id}`,
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [
          lang,
          `/${lang}/collection/${id}`,
        ]),
      ),
    },
  }
}
