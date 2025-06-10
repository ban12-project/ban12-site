'use client'

import { Suspense, use, useEffect, useState } from 'react'
import { Button } from '@repo/ui/components/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@repo/ui/components/command'
import { LoaderCircleIcon } from 'lucide-react'

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
      <Button
        variant="outline"
        className="top-safe-max-4 right-safe-max-4 bg-muted/80 text-muted-foreground absolute h-8 w-full justify-start rounded-[0.5rem] text-sm font-normal shadow-none saturate-[180%] backdrop-blur-[20px] backdrop-filter sm:pr-12 md:w-40 lg:w-56 xl:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search address...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="bg-muted pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <Suspense fallback={<LoaderCircleIcon />}>
            <RenderCommandGroup {...props} />
          </Suspense>
        </CommandList>
      </CommandDialog>
    </>
  )
}

function RenderCommandGroup({ restaurants }: Props) {
  const data = use(restaurants)

  return (
    <>
      <CommandGroup heading="Suggestions">
        <CommandItem>near me</CommandItem>
      </CommandGroup>
      <CommandGroup heading="Restaurants">
        {data.map((restaurant) => (
          <CommandItem key={restaurant.id}>
            <div>
              {restaurant.title}
              <p className="text-sm">{restaurant.description}</p>
            </div>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  )
}
