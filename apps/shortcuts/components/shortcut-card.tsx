import { Link } from '@repo/i18n/client';
import { cn } from '@repo/ui/lib/utils';
import { Layers2, Plus } from 'lucide-react';
import type { LinkProps } from 'next/link';
import type React from 'react';

import type { SelectShortcut } from '#/lib/db/schema';
import type { Locale } from '#/lib/i18n';
import { negativeToHexColor } from '#/lib/utils';

interface ShortcutCardProps
  extends Partial<LinkProps>,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  item: SelectShortcut;
  lang: Locale;
}

export default function ShortcutCard({
  item,
  className,
  lang,
  ...props
}: ShortcutCardProps) {
  return (
    <Link
      className={cn(
        'relative flex-none overflow-hidden rounded-3xl bg-[var(--background-color,#ef4444)] text-zinc-100 transition-all active:brightness-75',
        className,
      )}
      data-bg-raw={item.backgroundColor}
      href={`/get/${item.uuid}`}
      scroll={false}
      {...props}
      style={
        {
          ...props.style,
          '--background-color': item.backgroundColor
            ? negativeToHexColor(item.backgroundColor)
            : '',
        } as React.CSSProperties
      }
    >
      <h3 className="absolute bottom-3 left-3 right-3 max-h-12 overflow-hidden text-lg font-semibold leading-6">
        {item.name[lang]}
      </h3>

      <Layers2 className="absolute left-3 top-3 origin-top-left scale-125" />

      <button
        type="button"
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/30"
      >
        <Plus />
      </button>
    </Link>
  );
}
