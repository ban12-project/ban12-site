import { Suspense } from 'react'
import { Loader } from 'lucide-react'

import { getDictionary } from '#/lib/i18n'
import PageDrawer from '#/components/page-drawer'
import ShareButton from '#/components/share-button'
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
    <PageDrawer messages={messages} header={<ShareButton />}>
      <Suspense
        fallback={
          <div className="flex h-1/2 w-full flex-col items-center justify-center gap-2 text-zinc-500/90">
            <Loader className="h-6 w-6 animate-spin" />
            <p>{messages.common.loading}</p>
          </div>
        }
      >
        <ShortcutAdd className="flex-1" messages={messages} params={params} />
      </Suspense>
    </PageDrawer>
  )
}
