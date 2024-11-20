import type { Metadata } from 'next'
import { Link } from '@repo/i18n/client'
import { getDictionary, type Locale } from '#/lib/i18n'

import ShortcutPost from '#/components/shortcut-post'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang)
  return {
    title: messages.post.title,
    description: messages.post.description,
  }
}

export default async function PostPage(props: Props) {
  const params = await props.params;
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
