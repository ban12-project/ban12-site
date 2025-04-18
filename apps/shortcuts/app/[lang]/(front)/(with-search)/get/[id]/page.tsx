import { Suspense } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from '@repo/i18n/client'
import { Loader } from 'lucide-react'

import { getShortcutByUuid } from '#/lib/db/queries'
import { getDictionary } from '#/lib/i18n'
import ShortcutAdd, {
  preload,
  type ShortcutAddProps,
} from '#/components/shortcut-add'

type Props = {
  params: Promise<ShortcutAddProps['params']>
}

export default async function ShortcutPage(props: Props) {
  const params = await props.params
  preload(params.id)

  const messages = await getDictionary(params.lang)

  return (
    <>
      <Suspense
        fallback={
          <div className="flex h-1/2 w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
            <Loader className="h-6 w-6 animate-spin" />
            <p>{messages.common.loading}</p>
          </div>
        }
      >
        <ShortcutAdd messages={messages} params={params} fromNormalRoute />
      </Suspense>

      <div className="container-full">
        <Link href="/" className="text-blue-500 active:text-blue-500/80">
          {messages.common['go-home']}
        </Link>
      </div>
    </>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lang } = await params
  const shortcut = await getShortcutByUuid(id)

  if (!shortcut) notFound()

  return {
    title: shortcut.name[lang],
    description: shortcut.description[lang],
    openGraph: {
      images: `https://ban12.com/api/og?title=${shortcut.name[lang]}`,
    },
  }
}
