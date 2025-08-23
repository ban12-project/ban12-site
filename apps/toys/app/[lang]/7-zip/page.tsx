import { Metadata } from 'next'

import { getDictionary, Locale } from '#/lib/i18n'
import SevenZip from '#/components/7-zip'

export async function generateMetadata({ params }: PageProps<'/[lang]/7-zip'>): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang as Locale)

  return {
    title: messages['7zip'].title,
    description: messages['7zip'].description,
  }
}
export default function SevenZipPage() {
  return <SevenZip />
}
