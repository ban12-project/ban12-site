import { Metadata } from 'next'
import { getDictionary, type Locale } from '#/i18n'

import FileExplorer from '#/components/file-explorer'

type Props = {
  params: Promise<{ lang: Locale }>
}

export const runtime = 'edge'

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang)

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
  }
}

export default async function HashPage(props: Props) {
  const params = await props.params
  const messages = await getDictionary(params.lang)

  return <FileExplorer messages={messages} />
}
