import type { Metadata } from 'next';

import { getDictionary, type Locale } from '#/lib/i18n';

import TextDiff from './text-diff';

export const instant = true;

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/text-compare'>): Promise<Metadata> {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);
  return {
    title: messages['text-compare'].title,
    keywords: messages['text-compare'].keywords,
    description: messages['text-compare'].description,
    alternates: { canonical: `/${lang}/text-compare` },
  };
}

export default async function TextComparePage({
  params,
}: PageProps<'/[lang]/text-compare'>) {
  const { lang } = await params;
  return <TextDiff locale={lang as Locale} />;
}
