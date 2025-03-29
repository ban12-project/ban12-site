import { Link } from '@repo/i18n/client'
import type { Locale, Messages } from '#/i18n'

import GLobalNav from './global-nav'

export type Props = {
  messages: Messages
  lang: Locale
  children?: React.ReactNode
}

export default function Header() {
  return (
    <header className="sticky top-0 z-1">
      <div className="supports-[padding:max(0px)]:px-safe-max-5 mx-auto flex h-[var(--layout-header-height)] max-w-7xl px-5">
        <h1 className="flex items-center">
          <Link href="/">Toys</Link>
        </h1>

        <GLobalNav />
      </div>
    </header>
  )
}
