import { Metadata } from 'next'

import { getDictionary, Locale } from '#/lib/i18n'

import TextDiff from './text-diff'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang)
  return {
    title: messages['text-compare'].title,
    keywords: messages['text-compare'].keywords,
    description: messages['text-compare'].description,
  }
}

export default function TextComparePage() {
  return <TextDiff />
}
