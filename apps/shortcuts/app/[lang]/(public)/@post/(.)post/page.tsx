import { getDictionary, type Locale } from '#/lib/i18n'
import ShortcutPost from '#/components/shortcut-post'

import Drawer from './drawer'

export default async function PostPage(props: PageProps<'/[lang]/post'>) {
  const { lang } = await props.params
  const messages = await getDictionary(lang as Locale)

  return (
    <Drawer messages={messages}>
      <ShortcutPost messages={messages} />
    </Drawer>
  )
}
