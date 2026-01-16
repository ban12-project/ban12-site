import { Skeleton } from '@repo/ui/components/skeleton';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ShortcutList from '#/components/shortcut-list';
import { getAlbumByIdWithShortcuts, getAlbums } from '#/lib/db/queries';
import { i18n, type Locale } from '#/lib/i18n';

export async function generateStaticParams() {
  const albums = await getAlbums();
  return albums.map((album) => ({ id: album.id.toString() }));
}

export default function AlbumListPage({
  params,
}: PageProps<'/[lang]/album/[id]'>) {
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
        <Album params={params} />
      </Suspense>
    </main>
  );
}

async function Album({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang } = (await params) as { id: string; lang: Locale };
  const NumericId = Number.parseInt(id, 10);

  const album = await getAlbumByIdWithShortcuts(NumericId);

  if (!album) notFound();

  return (
    <>
      <h2 className="text-3xl font-bold">{album.title[lang]}</h2>
      <ShortcutList lang={lang} shortcuts={album.shortcuts} />
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/album/[id]'>): Promise<Metadata> {
  const { id, lang } = await params;
  const album = await getAlbumByIdWithShortcuts(Number.parseInt(id, 10));

  if (!album) notFound();

  return {
    title: album.title[lang as Locale],
    description: album.description[lang as Locale],
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: `/album/${id}`,
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}/album/${id}`]),
      ),
    },
  };
}
