import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDictionary } from '#/get-dictionary'

import { fetchShortcutByID } from '#/lib/actions'
import ShortcutAdd, { ShortcutAddProps } from '#/components/ui/shortcut-add'
import Link from '#/components/link'

export default async function ShortcutPage({
  params,
}: Omit<ShortcutAddProps, 'messages'>) {
  const messages = await getDictionary(params.lang)

  return (
    <>
      <ShortcutAdd messages={messages} params={params} />

      <div className="container-full">
        <Link href="/" className="text-blue-500 active:text-blue-500/80">
          {messages.common['go-home']}
        </Link>
      </div>
    </>
  )
}

export async function generateMetadata({
  params,
}: Omit<ShortcutAddProps, 'messages'>): Promise<Metadata> {
  const shortcut = await fetchShortcutByID(params.id)

  if (!shortcut) notFound()

  return {
    title: shortcut.name,
    description: shortcut.description,
  }
}
