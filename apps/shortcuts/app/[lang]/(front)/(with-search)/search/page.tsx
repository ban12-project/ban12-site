import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, type Locale } from '#/i18n'

import { searchShortcuts } from '#/lib/actions'
import ShortcutList from '#/components/ui/shortcut-list'

type SearchPageProps = {
  params: {
    lang: Locale
  }
  searchParams?: {
    query?: string
    page?: string
  }
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const query = searchParams?.query || ''
  if (!query) notFound()

  const [messages, result] = await Promise.all([
    getDictionary(params.lang),
    searchShortcuts(query),
  ])

  return (
    <main className="container-full pt-safe-max-4">
      {Array.isArray(result) ? (
        <ShortcutList shortcuts={result} />
      ) : (
        <p className="flex h-96 flex-col items-center justify-center text-zinc-500/90">
          {result.message}
        </p>
      )}
    </main>
  )
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const query = searchParams?.query || ''
  const messages = await getDictionary(params.lang)

  return {
    title: `${messages.common.search} ${query}`,
    description: `${messages.common.search} ${query}`,
  }
}
