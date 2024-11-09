import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@repo/i18n/client'
import { getDictionary } from '#/i18n'

import { fetchShortcutByID } from '#/lib/actions'
import ShortcutAdd, {
  preload,
  type ShortcutAddProps,
} from '#/components/ui/shortcut-add'

type Props = {
  params: Promise<ShortcutAddProps['params']>
}

export default async function ShortcutPage(props: Props) {
  const params = await props.params
  preload(params.id)

  const messages = await getDictionary(params.lang)

  return (
    <>
      <ShortcutAdd messages={messages} params={params} fromNormalRoute />

      <div className="container-full">
        <Link href="/" className="text-blue-500 active:text-blue-500/80">
          {messages.common['go-home']}
        </Link>
      </div>
    </>
  )
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const shortcut = await fetchShortcutByID(params.id)

  if (!shortcut) notFound()

  return {
    title: shortcut.name,
    description: shortcut.description,
    openGraph: {
      images: `https://ban12.com/api/og?title=${shortcut.name}`,
    },
  }
}