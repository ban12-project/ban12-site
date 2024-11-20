import { Suspense } from 'react'
import { Metadata } from 'next'
import { Link } from '@repo/i18n/client'
import { getDictionary, type Locale } from '#/i18n'
import { Plus } from 'lucide-react'

import { fetchAlbums, fetchCollections } from '#/lib/actions'
import AlbumList from '#/components/ui/album-list'
import AlbumListSkeleton from '#/components/ui/album-list-skeleton'
import Collections from '#/components/ui/collections'
import CollectionsSkeleton from '#/components/ui/collections-skeleton'
import ColorSchemeToggle from '#/components/ui/color-scheme-toggle'

type HomePageProps = {
  params: Promise<{ lang: Locale }>
}

const preload = () => {
  // void evaluates the given expression and returns undefined
  // https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/void
  void fetchCollections()
  void fetchAlbums()
}

export default async function Home(props: HomePageProps) {
  const params = await props.params;
  // starting load home page data
  preload()

  const messages = await getDictionary(params.lang)

  return (
    <>
      <main className="pb-6">
        <div className="mx-safe-max-4 flex pb-6 pt-8 lg:mx-[var(--container-inset,0)] lg:pb-14 lg:pt-20 lg:text-3xl lg:tracking-wide">
          <h1 className="text-3xl text-[32px] font-bold lg:text-5xl">
            {messages.title}
          </h1>
        </div>
        <Suspense fallback={<CollectionsSkeleton />}>
          <Collections />
        </Suspense>
        <Suspense fallback={<AlbumListSkeleton />}>
          <AlbumList messages={messages} />
        </Suspense>
      </main>
      <footer className="container-full pb-safe-max-4 flex lg:pb-5">
        <Link
          href="/post"
          scroll={false}
          aria-label={messages.post.description}
        >
          <Plus />
        </Link>

        <ColorSchemeToggle className="ml-auto" />
      </footer>
    </>
  )
}

export async function generateMetadata(props: HomePageProps): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang)

  return {
    title: messages.title,
    description: messages.description,
  }
}
