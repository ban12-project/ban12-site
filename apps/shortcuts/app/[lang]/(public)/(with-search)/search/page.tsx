import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Loader } from 'lucide-react'

import { getDictionary, i18n, type Locale, type Messages } from '#/lib/i18n'
import ShortcutList from '#/components/shortcut-list'
import { searchShortcuts } from '#/app/[lang]/(public)/actions'

const preload = async (query: string) => {
  void searchShortcuts(query)
}

export default async function SearchPage(props: PageProps<'/[lang]/search'>) {
  const [searchParams, params] = await Promise.all([
    props.searchParams,
    props.params,
  ])
  const query = searchParams?.query || ''
  if (!query) notFound()

  preload(query as string)
  const messages = await getDictionary(params.lang as Locale)

  return (
    <main className="container-full pt-safe-max-4">
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100dvh-70px-1rem)] w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
            <Loader className="h-6 w-6 animate-spin" />
            <p>{messages.common.loading}</p>
          </div>
        }
      >
        <SearchResults params={params as { lang: Locale }} query={query as string} messages={messages} />
      </Suspense>
    </main>
  )
}

async function SearchResults({
  params,
  query,
  messages,
}: {
  params: { lang: Locale }
  query: string
  messages: Messages
}) {
  const result = await searchShortcuts(query)

  return Array.isArray(result) ? (
    result.length === 0 ? (
      <p className="flex h-96 flex-col items-center justify-center text-zinc-500/90">
        {messages.common.no_results}
      </p>
    ) : (
      <ShortcutList lang={params.lang} shortcuts={result} />
    )
  ) : (
    <p className="flex h-96 flex-col items-center justify-center text-zinc-500/90">
      {result.message}
    </p>
  )
}

export async function generateMetadata(
  props: PageProps<'/[lang]/search'>,
): Promise<Metadata> {
  const searchParams = await props.searchParams
  const params = await props.params
  const query = searchParams?.query || ''
  const messages = await getDictionary(params.lang as Locale)

  return {
    title: `${messages.common.search} ${query}`,
    description: `${messages.common.search} ${query}`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: '/search',
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}/search`]),
      ),
    },
  }
}
