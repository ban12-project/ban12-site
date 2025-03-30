import { Link } from '@repo/i18n/client'

export default function GLobalNav() {
  return (
    <nav className="flex flex-1 justify-center">
      <Link
        className="flex h-full select-none items-center rounded-[4px] px-3 font-medium leading-none text-rose-500 no-underline outline-hidden hover:bg-rose-50 focus:shadow-[0_0_0_2px] focus:shadow-rose-500"
        href="/hash"
      >
        hash
      </Link>

      <Link
        className="flex h-full select-none items-center rounded-[4px] px-3 font-medium leading-none text-rose-500 no-underline outline-hidden hover:bg-rose-50 focus:shadow-[0_0_0_2px] focus:shadow-rose-500"
        href="/7-zip"
      >
        7-zip
      </Link>
    </nav>
  )
}
