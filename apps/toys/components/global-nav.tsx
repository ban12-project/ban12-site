'use client'

import { ComponentRef, forwardRef, useState } from 'react'
import { LinkProps } from 'next/link'
import { CaretDownIcon } from '@radix-ui/react-icons'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { Link as _Link } from '@repo/i18n/client'

import { cn } from '#/lib/utils'
import LocaleSwitcher from '#/components/locale-switcher'
import { ThemeToggle } from '#/components/theme-toggle'

import type { Props } from './header'
import MenuIcon from './menu-icon'

const Link = forwardRef<
  ComponentRef<'a'>,
  React.AnchorHTMLAttributes<ComponentRef<'a'>> & LinkProps
>(function Link({ children, ...props }, forwardedRef) {
  return (
    <NavigationMenu.Link asChild>
      <_Link {...props} ref={forwardedRef} passHref>
        {children}
      </_Link>
    </NavigationMenu.Link>
  )
})

const ListItem = forwardRef<
  ComponentRef<'a'>,
  React.AnchorHTMLAttributes<ComponentRef<'a'>> & LinkProps
>(function ListItem({ className, children, title, ...props }, forwardedRef) {
  return (
    <li>
      <Link
        className={cn(
          'hover:bg-mauve3 block select-none rounded-[6px] p-3 leading-none no-underline outline-none transition-colors focus:shadow-[0_0_0_2px] focus:shadow-rose-500',
          className,
        )}
        {...props}
        ref={forwardedRef}
        passHref
      >
        <div className="text-violet12 mb-[5px] font-medium leading-[1.2]">
          {title}
        </div>
        <p className="text-mauve11 leading-[1.4]">{children}</p>
      </Link>
    </li>
  )
})

export default function GLobalNav({ messages, lang }: Props) {
  const [open, setOpen] = useState(false)

  const onValueChange = (value: string) => {
    setOpen(value === 'mobile')
  }

  return (
    <NavigationMenu.Root
      onValueChange={onValueChange}
      className="relative flex w-full justify-center"
    >
      <NavigationMenu.List className="hidden md:flex">
        {/* <NavigationMenu.Item className="h-[var(--layout-header-height)] py-1 md:block">
          <NavigationMenu.Trigger className="group flex h-full select-none items-center justify-between gap-[2px] rounded-[4px] px-3 font-medium leading-none text-rose-500 outline-none hover:bg-rose-50 focus:shadow-[0_0_0_2px] focus:shadow-rose-500">
            Charts
            <CaretDownIcon
              className="relative top-[1px] text-rose-400 transition-transform duration-[250ms] ease-in group-data-[state=open]:-rotate-180"
              aria-hidden
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="data-[motion=from-end]:animate-enterFromRight data-[motion=from-start]:animate-enterFromLeft data-[motion=to-end]:animate-exitToRight data-[motion=to-start]:animate-exitToLeft absolute left-0 top-0 w-full sm:w-auto">
            <ul className="grid gap-x-2.5 p-[22px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr]">
              <li className="row-span-3 grid">
                <NavigationMenu.Link
                  className="flex h-full w-full select-none flex-col justify-end rounded-[6px] bg-gradient-to-b from-red-500 to-amber-500 p-[25px] no-underline outline-none focus:shadow-[0_0_0_2px] focus:shadow-rose-500"
                  href="/"
                >
                  <svg
                    aria-hidden
                    width="38"
                    height="38"
                    viewBox="0 0 25 25"
                    fill="white"
                  >
                    <path d="M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z"></path>
                    <path d="M12 0H4V8H12V0Z"></path>
                    <path d="M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z"></path>
                  </svg>
                  <div className="mb-[7px] mt-4 text-[18px] font-medium leading-[1.2] text-white">
                    Radix Primitives
                  </div>
                  <p className="text-mauve4 text-[14px] leading-[1.3]">
                    Unstyled, accessible components for React.
                  </p>
                </NavigationMenu.Link>
              </li>

              <ListItem href="https://stitches.dev/" title="Stitches">
                CSS-in-JS with best-in-class developer experience.
              </ListItem>
              <ListItem href="/colors" title="Colors">
                Beautiful, thought-out palettes with auto dark mode.
              </ListItem>
              <ListItem href="https://icons.radix-ui.com/" title="Icons">
                A crisp set of 15x15 icons, balanced and consistent.
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item className="h-[var(--layout-header-height)] py-1 md:block">
          <NavigationMenu.Trigger className="group flex h-full select-none items-center justify-between gap-[2px] rounded-[4px] px-3 font-medium leading-none text-rose-500 outline-none hover:bg-rose-50 focus:shadow-[0_0_0_2px] focus:shadow-rose-500">
            Ranking
            <CaretDownIcon
              className="relative top-[1px] text-rose-400 transition-transform duration-[250ms] ease-in group-data-[state=open]:-rotate-180"
              aria-hidden
            />
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="absolute left-0 top-0 w-full sm:w-auto">
            <ul className="grid list-none gap-x-2.5 p-[22px] sm:w-[360px] sm:grid-flow-col sm:grid-rows-2">
              <ListItem href="/cpu" title="CPU">
                All CPU ranking
              </ListItem>
              <ListItem href="/gpu" title="GPU">
                All GPU ranking
              </ListItem>
              <ListItem href="/soc" title="SOC">
                All SOC ranking
              </ListItem>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item> */}

        <NavigationMenu.Item className="h-[var(--layout-header-height)] py-1 md:block">
          <Link
            className="flex h-full select-none items-center rounded-[4px] px-3 font-medium leading-none text-rose-500 no-underline outline-none hover:bg-rose-50 focus:shadow-[0_0_0_2px] focus:shadow-rose-500"
            href="/hash"
          >
            hash
          </Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item className="h-[var(--layout-header-height)] py-1 md:block">
          <Link
            className="flex h-full select-none items-center rounded-[4px] px-3 font-medium leading-none text-rose-500 no-underline outline-none hover:bg-rose-50 focus:shadow-[0_0_0_2px] focus:shadow-rose-500"
            href="/7-zip"
          >
            7-zip
          </Link>
        </NavigationMenu.Item>

        <NavigationMenu.Indicator className="data-[state=hidden]:animate-fadeOut data-[state=visible]:animate-fadeIn top-full flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]">
          <div className="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-white" />
        </NavigationMenu.Indicator>
      </NavigationMenu.List>

      <NavigationMenu.Item
        className="ml-auto h-[var(--layout-header-height)] py-1 md:hidden"
        asChild
        value="mobile"
      >
        <div>
          <NavigationMenu.Trigger asChild>
            <button className="relative z-10 h-full">
              <MenuIcon open={open} />
            </button>
          </NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <ul className="flex flex-col items-center space-y-5 p-5">
              <li>
                <Link href="/qr-code">QR Code</Link>
              </li>
              <li>
                <Link href="/hash">HASH 256</Link>
              </li>
              <li>
                <Link href="/7-zip">7-zip</Link>
              </li>
              <NavigationMenu.Link asChild>
                <li className="space-x-6">
                  <LocaleSwitcher lang={lang} />
                </li>
              </NavigationMenu.Link>
              <NavigationMenu.Link asChild>
                <li>
                  <ThemeToggle className="flex" messages={messages} />
                </li>
              </NavigationMenu.Link>
            </ul>
          </NavigationMenu.Content>
        </div>
      </NavigationMenu.Item>

      <div className="top perspective-[2000px] fixed left-0 z-[2] flex w-full justify-center md:absolute md:top-full">
        <NavigationMenu.Viewport className="data-[state=closed]:animate-scaleOut data-[state=open]:animate-scaleIn relative h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden bg-white shadow-[0_10px_38px_-10px] shadow-rose-100 backdrop-blur-[20px] backdrop-saturate-[180%] transition-[width,_height] duration-300 supports-[backdrop-filter:blur(0)]:bg-opacity-80 sm:w-[var(--radix-navigation-menu-viewport-width)] md:mt-2.5 md:rounded-[6px]" />
      </div>
    </NavigationMenu.Root>
  )
}
