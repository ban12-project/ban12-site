import { Suspense } from 'react'
import { getDictionary } from '#/i18n'
import { Loader } from 'lucide-react'

import PageDrawer from '#/components/ui/page-drawer'
import ShareButton from '#/components/ui/share-button'
import ShortcutAdd, {
  preload,
  type ShortcutAddProps,
} from '#/components/ui/shortcut-add'

export default async function ShortcutPage({
  params,
}: Omit<ShortcutAddProps, 'messages'>) {
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
        <ShortcutAdd messages={messages} params={params} />
      </Suspense>
    </PageDrawer>
  )
}
