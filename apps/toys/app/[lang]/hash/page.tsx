import { Metadata } from 'next'
import { getDictionary, type Locale } from '#/i18n'

import FileExplorer from '#/components/ui/file-explorer'

type Props = {
  params: { lang: Locale }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getDictionary(params.lang)

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
  }
}

export default async function HashPage({ params }: Props) {
  const messages = await getDictionary(params.lang)

  return <FileExplorer messages={messages} />
}
