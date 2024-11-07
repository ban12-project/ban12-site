import { getDictionary, type Locale } from '#/i18n'

import ShortcutPost from '#/components/ui/shortcut-post'

import Drawer from './drawer'

export default async function PostPage(props: { params: Promise<{ lang: Locale }> }) {
  const messages = await getDictionary((await props.params).lang)

  return (
    <Drawer messages={messages}>
      <ShortcutPost messages={messages} />
    </Drawer>
  )
}
