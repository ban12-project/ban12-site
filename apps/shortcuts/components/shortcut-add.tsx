import { notFound } from 'next/navigation'
import { Button } from '@repo/ui/components/button'
import { cn } from '@repo/ui/lib/utils'
import SuperEllipseSVG from '@repo/ui/super-ellipse-svg'
import { Plus, Share } from 'lucide-react'

import { getShortcutByUuid } from '#/lib/db/queries'
import type { Locale, Messages } from '#/lib/i18n'
import ShortcutCard from '#/components/shortcut-card'

export interface ShortcutAddProps extends React.ComponentProps<'div'> {
  params: { id: string; lang: Locale }
  messages: Messages
  /** tag from normal route or not because this component may be used in interceptor route */
  fromNormalRoute?: boolean
}

export const preload = (id: string) => {
  void getShortcutByUuid(id)
}

export default async function ShortcutAdd({
  params: { id, lang },
  messages,
  fromNormalRoute,
  ...props
}: ShortcutAddProps) {
  const shortcut = await getShortcutByUuid(id)

  if (!shortcut) notFound()

  return (
    <>
      <SuperEllipseSVG width={176} height={128} n={8} id="clip-path" />
      <div
        {...props}
        className={cn(
          props.className,
          fromNormalRoute && 'lg:hidden',
          'flex flex-col',
        )}
      >
        <section className="p-safe-max-4 flex-1 space-y-4 overflow-auto text-center">
          <h3 className="text-3xl font-bold">{shortcut.name[lang]}</h3>

          {shortcut.description[lang].split('\n').map((item, index) => (
            <p key={index} className="text-lg text-zinc-500/90">
              {item}
            </p>
          ))}

          <ShortcutCard
            className="pointer-events-none inline-block h-32 w-44 text-left [clip-path:url(#clip-path)]"
            href={shortcut.icloud}
            item={shortcut}
            lang={lang}
          />
        </section>

        <footer className="pb-safe-max-8 px-safe-max-6 w-full pt-4 text-lg">
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
            className="h-12 w-full rounded-lg py-3 text-base [&_svg]:size-3"
            variant="primary"
            asChild
          >
            <a href={shortcut.icloud} rel="noopener noreferrer">
              <span className="mr-3 h-4 w-4 rounded-lg bg-white p-0.5">
                <Plus className="text-blue-500" strokeWidth={4} />
              </span>
              {messages['set-up-shortcut']}
            </a>
          </Button>
        </footer>
      </div>

      <div
        className={cn(
          'container-full hidden pb-8 [&>*+*]:mt-8 [&>*+*]:border-t [&>*+*]:border-zinc-200 [&>*+*]:pt-2 dark:[&>*+*]:border-zinc-700',
          fromNormalRoute && 'lg:block',
        )}
      >
        <div className="flex items-center gap-4">
          <ShortcutCard
            className="pointer-events-none inline-block h-32 w-44 text-left [clip-path:url(#clip-path)]"
            href={shortcut.icloud}
            item={shortcut}
            lang={lang}
          />

          <div className="space-y-4">
            <h1 className="text-xl font-semibold leading-6">
              {shortcut.name[lang]}
            </h1>

            <Button
              className="rounded-lg py-1 text-sm"
              variant="primary"
              asChild
              size="sm"
            >
              <a href={shortcut.icloud} rel="noopener noreferrer">
                {messages['set-up-shortcut']}
              </a>
            </Button>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 space-y-2">
            <h5 className="font-semibold">Description</h5>
            <p className="text-zinc-500/90">
              {shortcut.description[lang] || '-'}
            </p>
          </div>

          {/* <div className="flex-1 space-y-2">
            <h5 className="font-semibold">{messages.about}</h5>
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
            </ul>
          </div> */}
        </div>
      </div>
    </>
  )
}
