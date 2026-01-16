import { Link } from '@repo/i18n/client';
import { Loader } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ShortcutAdd, { type ShortcutAddProps } from '#/components/shortcut-add';
import { getShortcutByUuid, getShortcuts } from '#/lib/db/queries';
import { getDictionary, i18n } from '#/lib/i18n';

type Props = {
  params: Promise<ShortcutAddProps['params']>;
};

export async function generateStaticParams() {
  const shortcuts = await getShortcuts();
  return shortcuts.map((shortcut) => ({
    id: shortcut.uuid,
  }));
}

export default async function ShortcutPage(props: Props) {
  const params = await props.params;
  const messages = await getDictionary(params.lang);

  return (
    <>
      <Suspense
        fallback={
          <div className="flex h-1/2 w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
            <Loader className="h-6 w-6 animate-spin" />
            <p>{messages.common.loading}</p>
          </div>
        }
      >
        <ShortcutAdd messages={messages} params={params} fromNormalRoute />
      </Suspense>

      <div className="container-full">
        <Link href="/" className="text-blue-500 active:text-blue-500/80">
          {messages.common['go-home']}
        </Link>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lang } = await params;
  const shortcut = await getShortcutByUuid(id);

  if (!shortcut) notFound();

  if (!process.env.NEXT_PUBLIC_HOST_URL) {
    throw new Error('NEXT_PUBLIC_HOST_URL is not defined');
  }

  return {
    title: shortcut.name[lang],
    description: shortcut.description[lang],
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL),
    alternates: {
      canonical: `/get/${id}`,
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}/get/${id}`]),
      ),
    },
    openGraph: {
      images: `https://ban12.com/api/og?title=${shortcut.name[lang]}`,
    },
  };
}
