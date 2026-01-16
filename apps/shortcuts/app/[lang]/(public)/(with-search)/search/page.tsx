import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { searchShortcuts } from '#/app/[lang]/(public)/actions';
import ShortcutList from '#/components/shortcut-list';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';

export default function SearchPage({
  params,
  searchParams,
}: PageProps<'/[lang]/search'>) {
  return (
    <main className="container-full pt-safe-max-4">
      <Suspense
        fallback={
          <div className="flex min-h-[calc(100dvh-70px-1rem)] w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
            <Loader className="h-6 w-6 animate-spin" />
            <p>Loading</p>
          </div>
        }
      >
        <SearchResults params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchResults(props: PageProps<'/[lang]/search'>) {
  const [{ lang }, searchParams] = await Promise.all([
    props.params as Promise<{ lang: Locale }>,
    props.searchParams,
  ]);

  const messages = await getDictionary(lang);
  const query = searchParams?.query || '';
  if (!query) notFound();

  const result = await searchShortcuts(query as string);

  return Array.isArray(result) ? (
    result.length === 0 ? (
      <p className="flex h-96 flex-col items-center justify-center text-zinc-500/90">
        {messages.common.no_results}
      </p>
    ) : (
      <ShortcutList lang={lang} shortcuts={result} />
    )
  ) : (
    <p className="flex h-96 flex-col items-center justify-center text-zinc-500/90">
      {result.message}
    </p>
  );
}

export async function generateMetadata(
  props: PageProps<'/[lang]/search'>,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const query = searchParams?.query || '';
  const messages = await getDictionary(params.lang as Locale);

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
  };
}
