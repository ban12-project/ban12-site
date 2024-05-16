import { notFound } from 'next/navigation'
import { Messages } from '#/get-dictionary'
import { Locale } from '#/i18n-config'
import { Plus, Share } from 'lucide-react'

import { fetchShortcutByID } from '#/lib/actions'
import { Button } from '#/components/ui/button'
import ShortcutCard from '#/components/ui/shortcut-card'

export type ShortcutAddProps = {
  params: { id: string; lang: Locale }
  messages: Messages
}

export default async function ShortcutAdd({
  params,
  messages,
}: ShortcutAddProps) {
  const shortcut = await fetchShortcutByID(params.id)

  if (!shortcut) notFound()

  return (
    <>
      <section className="flex-1 space-y-4 overflow-auto text-center p-safe-max-4">
        <h3 className="text-3xl font-bold">{shortcut.name}</h3>

        {shortcut.description?.split('\n').map((item, index) => (
          <p key={index} className="text-lg text-zinc-500/90">
            {item}
          </p>
        ))}

        <ShortcutCard
          className="pointer-events-none inline-block h-32 w-44 text-left"
          href={shortcut.icloud}
          item={shortcut}
        />
      </section>

      <footer className="w-full pt-4 text-lg pb-safe-max-8 px-safe-max-6">
        {/* <p className="font-semibold text-zinc-500/90">{messages.about}</p>

        <ul className="mb-6 mt-3 space-y-3">
          <li className="flex items-center gap-2">
            <Share /> Appears on Apple Watch
          </li>
          <li className="flex items-center gap-2">
            <Share /> 在 Mac 快速操作中中显示
          </li>
          <li className="flex items-center gap-2">
            <Share /> 在共享表单中显示
          </li>
        </ul> */}

        <Button
          className="h-12 w-full rounded-lg py-3 text-base"
          variant="primary"
          asChild
        >
          <a
            href={`https://www.icloud.com/shortcuts/${shortcut.uuid}`}
            rel="noopener noreferrer"
          >
            <span className="mr-3 h-4 w-4 rounded-lg bg-white p-0.5">
              <Plus className="h-3 w-3 text-blue-500" strokeWidth={4} />
            </span>
            {messages['set-up-shortcut']}
          </a>
        </Button>
      </footer>
    </>
  )
}
