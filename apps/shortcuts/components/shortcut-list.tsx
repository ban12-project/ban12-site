import type { SelectShortcut } from '#/lib/db/schema'
import { Locale } from '#/lib/i18n'

import ShortcutCard from './shortcut-card'

type ShortcutListProps = { shortcuts: SelectShortcut[]; lang: Locale }

export default function ShortcutList({ shortcuts, lang }: ShortcutListProps) {
  return (
    <ul className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {shortcuts.map((item) => (
        <li key={item.uuid} className="flex h-32">
          <ShortcutCard
            lang={lang}
            className="w-[calc((100%-0.75rem)/2)]"
            item={item}
          />
          <p className="ms-3 h-full overflow-hidden text-ellipsis leading-[25.6px] text-zinc-500/90">
            {item.description[lang]}
          </p>
        </li>
      ))}
    </ul>
  )
}
