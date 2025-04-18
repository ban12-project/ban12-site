'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { cn } from '@repo/ui/lib/utils'
import { useOnClickOutside } from 'usehooks-ts'

import type { Messages } from '#/lib/i18n'
import SearchBar from '#/components/search-bar'

type HeaderProps = {
  messages: Messages
}

export function Header({ messages }: HeaderProps) {
  const [sticky, setSticky] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const ref = useRef<React.ComponentRef<'header'>>(null)
  const sentinelRef = useRef<React.ComponentRef<'div'>>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsScrolled(!entry.isIntersecting)
        })
      },
      {
        root: null,
        rootMargin: `0px 0px`,
        threshold: 0,
      },
    )
    observer.observe(sentinelRef.current!)
    return () => observer.disconnect()
  }, [])

  useOnClickOutside(
    // @ts-expect-error - https://github.com/juliencrn/usehooks-ts/issues/663
    ref,
    () => {
      if (!sticky) return
      ;(document.activeElement as HTMLElement).blur()
    },
    'touchstart',
  )

  return (
    <>
      <div ref={sentinelRef}></div>
      <header
        ref={ref}
        className={cn(
          'pt-safe-max-4 px-safe-max-4 lg:pt-safe-max-4 group top-0 z-10 overflow-hidden border-b border-transparent bg-transparent pb-4 saturate-[180%] backdrop-blur-[20px] backdrop-filter transition-colors md:sticky',
          {
            sticky,
            'border-neutral-100/80 bg-zinc-50/80 dark:border-neutral-800/80 dark:bg-zinc-950/80':
              sticky && isScrolled,
            'md:border-neutral-100/80 md:bg-zinc-50/80 md:dark:border-neutral-800/80 md:dark:bg-zinc-950/80':
              isScrolled,
          },
        )}
        data-sticky={sticky}
      >
        <Suspense>
          <SearchBar
            messages={messages.common}
            setSticky={setSticky}
            className="ms-auto md:max-w-sm"
          />
        </Suspense>
      </header>
    </>
  )
}
