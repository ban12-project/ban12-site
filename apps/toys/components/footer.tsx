import Link from 'next/link'

import Ban12 from './ban12'

export default function Footer() {
  return (
    <footer>
      <div className="px-safe-max-4 container mx-auto grid grid-cols-2 md:grid-cols-3 md:px-0">
        <div className="col-span-2 px-4 py-10 md:col-span-1">
          <Ban12 className="mx-auto md:ml-0 w-[160px] block" />
        </div>
        <div className="px-4 py-10">
          <h3 className="font-semibold">Links</h3>
          <ul className="grid gap-4 pt-5">
            <li>
              <Link className="hover:underline" href="https://ban12.com">
                Ban12
              </Link>
            </li>
            <li>
              <Link
                className="hover:underline"
                href="https://shortcuts.ban12.com"
              >
                Shortcuts
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="https://blog.ban12.com">
                Blog
              </Link>
            </li>
          </ul>
        </div>
        <div className="px-4 py-10">
          <h3 className="font-semibold">Find me</h3>
          <ul className="grid gap-4 pt-5">
            <li>
              <Link
                className="hover:underline"
                href="https://github.com/relkrahs"
              >
                GitHub
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="mailto:coda@ban12.com">
                Email
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
