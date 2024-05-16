import type { Metadata } from 'next'
import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import ShortcutPost from '#/components/ui/shortcut-post'
import Link from '#/components/link'

type Props = {
  params: { lang: Locale }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const messages = await getDictionary(params.lang)
  return {
    title: messages.post.title,
    description: messages.post.description,
  }
}

export default async function PostPage({ params }: Props) {
  const messages = await getDictionary(params.lang)

  return (
    <>
      <ShortcutPost messages={messages} />

      <div className="container-full">
        <Link href="/" className="text-blue-500 active:text-blue-500/80">
          {messages.common['go-home']}
        </Link>
      </div>
    </>
  )
}
