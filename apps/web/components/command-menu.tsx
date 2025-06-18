'use client'

import { Suspense, use, useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@repo/ui/components/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@repo/ui/components/command'
import { LoaderCircleIcon, MapPin, SearchIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useMediaQuery } from 'usehooks-ts'
import { Drawer } from 'vaul'

import type { SelectRestaurant } from '#/lib/db/schema'

type Props = {
  restaurants: Promise<SelectRestaurant[]>
}

export function CommandMenu(props: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <>
      <button className="md:hidden" onClick={() => setOpen(true)}>
        <SearchIcon />
      </button>
      <Button
        variant="outline"
        className="bg-muted/80 text-muted-foreground hidden h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none saturate-[180%] backdrop-blur-[20px] backdrop-filter sm:pr-12 md:inline-flex md:w-40 lg:w-56 xl:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search address...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="bg-muted pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <Suspense fallback={<LoaderCircleIcon />}>
            <RenderCommandGroup {...props} closeMenu={() => setOpen(false)} />
          </Suspense>
        </CommandList>
      </ResponsiveDialog>
    </>
  )
}

function RenderCommandGroup({
  restaurants,
  closeMenu,
}: Props & { closeMenu: () => void }) {
  const data = use(restaurants)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'm' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        requestGeolocation()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const requestGeolocation = () => {
    if (!navigator.geolocation)
      return toast.error('Geolocation is not supported by this browser.')

    startTransition(async () => {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          },
        )
        go(position.coords.longitude, position.coords.latitude)
      } catch (error) {
        if (error instanceof GeolocationPositionError) {
          toast.error(`ERROR(${error.code}): ${error.message}`)
        }
      }
    })
  }

  const go = (lng: number, lat: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('location', `${lng},${lat}`)
    replace(`${pathname}?${params.toString()}`)
    closeMenu()
  }

  return (
    <>
      <CommandGroup heading="Suggestions">
        <CommandItem disabled={isPending} onSelect={requestGeolocation}>
          <MapPin />
          Near me
          <CommandShortcut>⌘M</CommandShortcut>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Restaurants">
        {data.map((restaurant) => (
          <CommandItem
            key={restaurant.id}
            onSelect={() => {
              if (!restaurant.location) return toast.info('No found location')
              go(...restaurant.location)
            }}
          >
            <span>{restaurant.title}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  )
}

function ResponsiveDialog({
  children,
  ...props
}: { children: React.ReactNode } & (
  | React.ComponentProps<typeof CommandDialog>
  | React.ComponentProps<typeof Drawer.Root>
)) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) return <CommandDialog {...props}>{children}</CommandDialog>

  return (
    <Drawer.Root {...props}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 mt-24 flex h-[80vh] flex-col rounded-t-[10px] outline-none">
          <Drawer.Title className="sr-only"></Drawer.Title>
          <Drawer.Description className="sr-only"></Drawer.Description>
          <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 rounded-none [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            {children}
          </Command>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
