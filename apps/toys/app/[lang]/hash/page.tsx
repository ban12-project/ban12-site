import { Metadata } from 'next'

import { getDictionary, type Locale } from '#/lib/i18n'
import FileExplorer from '#/components/file-explorer'

export async function generateMetadata(props: PageProps<'/[lang]/hash'>): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang as Locale)

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
  }
}

export default async function HashPage(props: PageProps<'/[lang]/hash'>) {
  const params = await props.params
  const messages = await getDictionary(params.lang as Locale)

  return <FileExplorer messages={messages} />
}
