import type { Metadata } from 'next';
import SevenZipShell from '#/components/seven-zip-shell';
import ToolHeader from '#/components/tool-header';
import { getDictionary, type Locale } from '#/lib/i18n';
import { toolCopy } from '#/lib/tool-copy';

export const instant = true;

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/7-zip'>): Promise<Metadata> {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);

  return {
    title: messages['7zip'].title,
    description: messages['7zip'].description,
    alternates: { canonical: `/${lang}/7-zip` },
  };
}

export default async function SevenZipPage({
  params,
}: PageProps<'/[lang]/7-zip'>) {
  const { lang } = await params;
  const locale = lang as Locale;
  const copy =
    locale === 'zh-CN' ? toolCopy['zh-CN'].sevenZip : toolCopy.en.sevenZip;

  return (
    <main id="main-content" className="mx-auto min-h-dvh max-w-3xl px-5 py-12">
      <ToolHeader title={copy.title} description={copy.description} />
      <SevenZipShell locale={locale} />
    </main>
  );
}
