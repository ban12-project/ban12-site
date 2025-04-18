import { Metadata } from 'next'

import { getDictionary, Locale } from '#/lib/i18n'
import SevenZip from '#/components/7-zip'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return {
    title: messages['7zip'].title,
    description: messages['7zip'].description,
  }
}
export default function SevenZipPage() {
  return <SevenZip />
}
