import { Suspense, ViewTransition } from 'react';
import AlbumList from '#/components/album-list';
import AlbumListSkeleton from '#/components/album-list-skeleton';
import Collections from '#/components/collections';
import CollectionsSkeleton from '#/components/collections-skeleton';
import ColorSchemeToggle from '#/components/color-scheme-toggle';
import PostButton from '#/components/post-button';
import { getDictionary, type Locale } from '#/lib/i18n';

export default async function Home(props: PageProps<'/[lang]'>) {
  const params = await props.params;
  const messages = await getDictionary(params.lang as Locale);

  return (
    <>
      <main className="pb-6">
        <div className="mx-safe-max-4 flex pb-6 pt-8 lg:mx-[var(--container-inset,0)] lg:pb-14 lg:pt-20 lg:text-3xl lg:tracking-wide">
          <h1 className="text-3xl text-[32px] font-bold lg:text-5xl">
            {messages.title}
          </h1>
        </div>
        <ViewTransition>
          <Suspense fallback={<CollectionsSkeleton />}>
            <Collections lang={params.lang as Locale} />
          </Suspense>
        </ViewTransition>
        <ViewTransition>
          <Suspense fallback={<AlbumListSkeleton />}>
            <AlbumList lang={params.lang as Locale} messages={messages} />
          </Suspense>
        </ViewTransition>
      </main>
      <PostButton aria-label={messages.post.description} />
      <footer className="container-full pb-safe-max-4 flex lg:pb-5">
        <ColorSchemeToggle className="ms-auto" />
      </footer>
    </>
  );
}
