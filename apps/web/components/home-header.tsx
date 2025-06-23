'use client'

import * as React from 'react'
import { Link } from '@repo/i18n/client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@repo/ui/components/accordion'
import { Button } from '@repo/ui/components/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from '@repo/ui/components/navigation-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover'
import { cn } from '@repo/ui/lib/utils'

const components: { title: string; href: string; description: string }[] = [
  {
    title: '7-Zip',
    href: 'https://toys.ban12.com/7-zip',
    description:
      'A free and open-source file archiver, used to compress and decompress files.',
  },
  {
    title: 'ExifTool',
    href: 'https://toys.ban12.com/exif',
    description:
      'A powerful tool for reading, writing, and editing metadata in a wide variety of files.',
  },
  {
    title: 'Sha256',
    href: 'https://toys.ban12.com/hash',
    description:
      'Calc Sha256, just drag and drop it into the browser and it will calculate the hash for you.',
  },
  {
    title: 'Text Compare',
    href: 'https://toys.ban12.com/text-compare',
    description:
      'Compare text differences quickly and efficiently in your browser with this WebAssembly-powered tool.',
  },
]

export default function HomeHeader() {
  return (
    <header className="flex h-16 w-full items-center justify-between gap-8 border-b px-4 md:justify-start">
      <Link href="/" className="text-lg font-bold">
        Ban12
      </Link>
      <NavMenu />
    </header>
  )
}

function NavMenu() {
  const ref = React.useRef<{ toggle: () => void }>(null)

  return (
    <>
      <Popover onOpenChange={() => ref.current?.toggle()}>
        <PopoverTrigger asChild>
          <Button className="md:hidden" variant="ghost">
            <MenuTriggerBread ref={ref} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-dvw border-none">
          <ul className="text-sm">
            <li className="flex">
              <Link className="w-full py-4" href="/follow-up">
                Follow-up
              </Link>
            </li>
            <li className="flex">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="toys">
                  <AccordionTrigger>Toys</AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <ul className="grid w-full gap-2 md:grid-cols-2">
                      {components.map((component) => (
                        <li key={component.title} className="flex">
                          <Link className="w-full py-4" href={component.href}>
                            {component.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </li>
            <li className="flex">
              <Link className="w-full py-4" href="https://shortcuts.ban12.com">
                Shortcuts
              </Link>
            </li>
            <li className="flex">
              <Link className="w-full py-4" href="https://blog.ban12.com">
                Blog
              </Link>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="/follow-up">Follow-up</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Toys</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="https://shortcuts.ban12.com">Shortcuts</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              asChild
              className={navigationMenuTriggerStyle()}
            >
              <Link href="https://blog.ban12.com">Blog</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

function MenuTriggerBread({
  ref,
}: {
  ref?: React.Ref<{ toggle: () => void }>
}) {
  const openTop = React.useRef<SVGAnimateElement>(null)
  const openBottom = React.useRef<SVGAnimateElement>(null)
  const closeTop = React.useRef<SVGAnimateElement>(null)
  const closeBottom = React.useRef<SVGAnimateElement>(null)
  const isOpen = React.useRef(false)

  const toggle = () => {
    if (isOpen.current) {
      closeTop.current?.beginElement()
      closeBottom.current?.beginElement()
    } else {
      openTop.current?.beginElement()
      openBottom.current?.beginElement()
    }
    isOpen.current = !isOpen.current
  }

  React.useImperativeHandle(ref, () => ({ toggle }), [])

  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="2 12, 16 12"
      >
        <animate
          ref={openBottom}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 2 12, 16 12; 2 9, 16 9; 3.5 15, 15 3.5"
        ></animate>
        <animate
          ref={closeBottom}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 3.5 15, 15 3.5; 2 9, 16 9; 2 12, 16 12"
        ></animate>
      </polyline>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="2 5, 16 5"
      >
        <animate
          ref={openTop}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 2 5, 16 5; 2 9, 16 9; 3.5 3.5, 15 15"
        ></animate>
        <animate
          ref={closeTop}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 3.5 3.5, 15 15; 2 9, 16 9; 2 5, 16 5"
        ></animate>
      </polyline>
    </svg>
  )
}
