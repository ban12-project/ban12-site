import type { Metadata } from 'next';

import { getDictionary, type Locale } from '#/lib/i18n';

import TextDiff from './text-diff';

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/text-compare'>): Promise<Metadata> {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);
  return {
    title: messages['text-compare'].title,
    keywords: messages['text-compare'].keywords,
    description: messages['text-compare'].description,
  };
}

export default function TextComparePage() {
  return <TextDiff />;
}
