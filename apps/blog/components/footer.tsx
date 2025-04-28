import Link from 'next/link'

import GridContainer from '#/components/grid-container'

export default function Footer() {
  return (
    <GridContainer className="xl:max-w-5/6 relative mx-auto my-12 grid grid-cols-1 max-lg:max-w-2xl lg:my-24 lg:grid-cols-[24rem_2.5rem_minmax(0,1fr)]">
      <footer className="col-span-3 bg-white text-sm/loose text-gray-950 dark:bg-gray-950 dark:text-white">
        <div className="mx-auto grid w-full grid-cols-2 justify-between gap-y-0 *:first:border-l-0 *:last:border-r-0 md:grid-cols-4 md:gap-6 md:gap-x-4 lg:gap-8">
          <div className="not-md:border-0 flex flex-1 flex-col gap-10 border-x border-gray-950/5 p-4 md:border-b-0 md:py-10 md:pl-2 dark:border-white/10">
            <h3 className="font-semibold">Links</h3>
            <ul className="grid gap-4 md:mt-4">
              <li>
                <Link href="https://ban12.com/" className="hover:underline">
                  Ban12
                </Link>
              </li>
              <li>
                <Link
                  href="https://shortcuts.ban12.com/"
                  className="hover:underline"
                >
                  Shortcuts
                </Link>
              </li>
              <li>
                <Link
                  href="https://toys.ban12.com/"
                  className="hover:underline"
                >
                  Toys
                </Link>
              </li>
            </ul>
          </div>
          <div className="not-md:border-0 flex flex-1 flex-col gap-10 border-x border-gray-950/5 p-4 md:border-b-0 md:py-10 md:pl-2 dark:border-white/10">
            <h3 className="font-semibold">Find me</h3>
            <ul className="grid gap-4 md:mt-4">
              <li>
                <Link
                  href="https://github.com/NavOrange"
                  className="hover:underline"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="mailto:coda@ban12.com" className="hover:underline">
                  Email
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </GridContainer>
  )
}
