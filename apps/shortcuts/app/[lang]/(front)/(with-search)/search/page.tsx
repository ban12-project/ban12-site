import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary, type Locale } from '#/lib/i18n'

import { searchShortcuts } from '#/app/[lang]/(front)/actions'
import ShortcutList from '#/components/shortcut-list'

type SearchPageProps = {
  params: Promise<{
    lang: Locale
  }>
  searchParams?: Promise<{
    query?: string
    page?: string
  }>
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const query = searchParams?.query || ''
  if (!query) notFound()

  const [messages, result] = await Promise.all([
    getDictionary(params.lang),
    searchShortcuts(query),
  ])

  return (
    <main className="container-full pt-safe-max-4">
      {Array.isArray(result) ? (
        <ShortcutList lang={params.lang} shortcuts={result} />
      ) : (
        <p className="flex h-96 flex-col items-center justify-center text-zinc-500/90">
          {result.message}
        </p>
      )}
    </main>
  )
}

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const query = searchParams?.query || ''
  const messages = await getDictionary(params.lang)

  return {
    title: `${messages.common.search} ${query}`,
    description: `${messages.common.search} ${query}`,
  }
}
