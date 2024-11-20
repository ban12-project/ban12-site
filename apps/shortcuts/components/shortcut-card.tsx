import React from 'react'
import { LinkProps } from 'next/link'
import { Link } from '@repo/i18n/client'
import type { SelectShortcut } from '#/drizzle/schema'
import { Layers2, Plus } from 'lucide-react'

import { cn, negativeToHexColor } from '#/lib/utils'

interface ShortcutCardProps
  extends Partial<LinkProps>,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  item: SelectShortcut
}

export default function ShortcutCard({
  item,
  className,
  ...props
}: ShortcutCardProps) {
  return (
    <Link
      className={cn(
        'relative flex-none overflow-hidden rounded-3xl bg-[var(--background-color,#ef4444)] text-zinc-100 transition-all active:brightness-75',
        className,
      )}
      style={
        {
          '--background-color': item.backgroundColor
            ? negativeToHexColor(item.backgroundColor)
            : '',
        } as React.CSSProperties
      }
      data-bg-raw={item.backgroundColor}
      href={`/get/${item.uuid}`}
      scroll={false}
      {...props}
    >
      <h3 className="absolute bottom-3 left-3 right-3 max-h-12 overflow-hidden text-lg font-semibold leading-6">
        {item.name}
      </h3>

      <Layers2 className="absolute left-3 top-3 origin-top-left scale-125" />

      <button
        type="button"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white bg-opacity-30"
      >
        <Plus />
      </button>
    </Link>
  )
}
