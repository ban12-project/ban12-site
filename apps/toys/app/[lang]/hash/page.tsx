import type { Metadata } from 'next';
import FileExplorer from '#/components/file-explorer';
import { getDictionary, type Locale } from '#/lib/i18n';

export const unstable_instant = { prefetch: 'static' };

export async function generateMetadata(
  props: PageProps<'/[lang]/hash'>,
): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang as Locale);

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
    alternates: { canonical: `/${params.lang}/hash` },
  };
}

export default async function HashPage({ params }: PageProps<'/[lang]/hash'>) {
  const { lang } = await params;
  return <FileExplorer locale={lang as Locale} />;
}
