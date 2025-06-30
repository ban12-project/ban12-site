import { Suspense } from 'react'
import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { Skeleton } from '@repo/ui/components/skeleton'

import { getAlbumByIdWithShortcuts, getAlbums } from '#/lib/db/queries'
import type { Locale } from '#/lib/i18n'
import ShortcutList from '#/components/shortcut-list'

type ListPageProps = {
  params: Promise<{ id: string; lang: Locale }>
}

const preload = (id: number) => {
  void getCachedAlbumByIdWithShortcuts(id)
}

const getCachedAlbumByIdWithShortcuts = unstable_cache(
  getAlbumByIdWithShortcuts,
  ['album', 'shortcut'],
  { tags: ['album', 'shortcut'] },
)

export async function generateStaticParams() {
  const albums = await getAlbums()
  return albums.map((album) => ({ id: album.id.toString() }))
}

export default async function ListPage({ params }: ListPageProps) {
  const { id, lang } = await params
  const NumericId = Number.parseInt(id)
  preload(NumericId)

  return (
    <main className="container-full py-safe-max-4">
      <Suspense
        fallback={
          <div className="container-full pt-safe-max-4">
            <Skeleton className="h-9 w-1/3" />
            <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              <div className="flex h-32">
                <Skeleton className="h-full w-[calc((100%-0.75rem)/2)] rounded-3xl" />
                <div className="ml-3 flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
              <div className="flex h-32">
                <Skeleton className="h-full w-[calc((100%-0.75rem)/2)] rounded-3xl" />
                <div className="ml-3 flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <Album lang={lang} id={NumericId} />
      </Suspense>
    </main>
  )
}

async function Album({ lang, id }: { lang: Locale; id: number }) {
  const album = await getCachedAlbumByIdWithShortcuts(id)

  if (!album) notFound()

  return (
    <>
      <h2 className="text-3xl font-bold">{album.title[lang]}</h2>
      <ShortcutList lang={lang} shortcuts={album.shortcuts} />
    </>
  )
}

export async function generateMetadata({
  params,
}: ListPageProps): Promise<Metadata> {
  const { id, lang } = await params
  const album = await getCachedAlbumByIdWithShortcuts(Number.parseInt(id))

  if (!album) notFound()

  return {
    title: album.title[lang],
    description: album.description[lang],
  }
}
