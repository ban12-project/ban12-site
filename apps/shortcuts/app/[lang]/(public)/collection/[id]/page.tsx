import { Skeleton } from '@repo/ui/components/skeleton';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import AlbumList from '#/components/album-list';
import AlbumListSkeleton from '#/components/album-list-skeleton';
import ShortcutList from '#/components/shortcut-list';
import {
  getCollectionByIdWithAlbumsAndShortcuts,
  getCollections,
} from '#/lib/db/queries';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({
    id: collection.id.toString(),
  }));
}

export default function CollectionsPage({
  params,
}: PageProps<'/[lang]/collection/[id]'>) {
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
        <Collections params={params} />
      </Suspense>
    </main>
  );
}

async function Collections({
  params,
}: {
  params: PageProps<'/[lang]/collection/[id]'>['params'];
}) {
  const { id, lang } = (await params) as { id: string; lang: Locale };
  const NumericId = Number.parseInt(id, 10);
  const [messages, collection] = await Promise.all([
    getDictionary(lang),
    getCollectionByIdWithAlbumsAndShortcuts(NumericId),
  ]);

  if (!collection) notFound();

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
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/collection/[id]'>): Promise<Metadata> {
  const { id, lang } = await params;
  const collection = await getCollectionByIdWithAlbumsAndShortcuts(
    Number.parseInt(id, 10),
  );

  if (!collection) notFound();

  return {
    title: collection.title[lang as Locale],
    description: collection.title[lang as Locale],
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
  };
}
