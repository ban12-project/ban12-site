import { getDictionary } from '#/get-dictionary'
import { Locale } from '#/i18n-config'

import ShortcutPost from '#/components/ui/shortcut-post'

import Drawer from './drawer'

export default async function PostPage(props: { params: { lang: Locale } }) {
  const messages = await getDictionary(props.params.lang)

  return (
    <Drawer messages={messages}>
      <ShortcutPost messages={messages} />
    </Drawer>
  )
}
