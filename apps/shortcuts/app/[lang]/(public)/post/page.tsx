import type { Metadata } from 'next'
import { Link } from '@repo/i18n/client'

import { getDictionary, i18n, type Locale } from '#/lib/i18n'
import ShortcutPost from '#/components/shortcut-post'

type Props = {
  params: Promise<{ lang: Locale }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang)
  return {
    title: messages.post.title,
    description: messages.post.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: '/post',
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}/post`]),
      ),
    },
  }
}

export default async function PostPage(props: Props) {
  const params = await props.params
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
