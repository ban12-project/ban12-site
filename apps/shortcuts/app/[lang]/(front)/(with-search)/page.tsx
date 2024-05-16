import { Suspense } from 'react'
import { Metadata } from 'next'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'
import { Share2 } from 'lucide-react'

import AlbumList from '#/components/ui/album-list'
import AlbumListSkeleton from '#/components/ui/album-list-skeleton'
import Collections from '#/components/ui/collections'
import CollectionsSkeleton from '#/components/ui/collections-skeleton'
import ColorSchemeToggle from '#/components/ui/color-scheme-toggle'
import Link from '#/components/link'

type HomePageProps = {
  params: { lang: Locale }
}

export default async function Home({ params }: HomePageProps) {
  const messages = await getDictionary(params.lang)

  return (
    <>
      <main className="pb-6">
        <div className="flex pb-6 pt-8 mx-safe-max-4 lg:mx-[var(--container-inset,0)] lg:pb-14 lg:pt-20 lg:text-3xl lg:tracking-wide">
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
      <footer className="container-full flex pb-safe-max-4 lg:pb-5">
        <Link
          href="/post"
          scroll={false}
          aria-label={messages.post.description}
        >
          <Share2 />
        </Link>

        <ColorSchemeToggle className="ml-auto" />
      </footer>
    </>
  )
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const messages = await getDictionary(params.lang)

  return {
    title: messages.title,
    description: messages.description,
  }
}
