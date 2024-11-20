'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Messages } from '#/lib/i18n'
import { Drawer } from 'vaul'

import { cn } from '#/lib/utils'
import { useResponsive } from '#/hooks/use-responsive'

import { Button } from './ui/button'

type RawDrawerProps = React.ComponentProps<typeof Drawer.Root>

export type PageDrawerProps = RawDrawerProps &
  React.InputHTMLAttributes<HTMLDivElement> & {
    header?: React.ReactNode
    children: React.ReactNode
    messages: Messages
  }

export const PAGE_DRAWER_HEADER_ID = 'PAGE_DRAWER_HEADER_ID'

export default function PageDrawer({
  className,
  header,
  children,
  messages,
  ...rest
}: PageDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(true)

  const breakpoints = useResponsive()

  const onAnimationEnd: RawDrawerProps['onAnimationEnd'] = (open) => {
    if (!open) router.back()
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={setOpen}
      onAnimationEnd={onAnimationEnd}
      direction={breakpoints.lg ? 'right' : 'bottom'}
      {...rest}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex h-[96%] flex-col rounded-t-[10px] bg-white outline-none lg:left-auto lg:h-full lg:w-[460px] lg:rounded-none dark:bg-black',
            className,
          )}
        >
          <Drawer.Title className="sr-only">
            {messages['set-up-shortcut']}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {messages['set-up-shortcut']}
          </Drawer.Description>

          <div
            className="p-safe-max-4 flex justify-between"
            id={PAGE_DRAWER_HEADER_ID}
          >
            <Drawer.Close asChild>
              <Button variant="ios" size="auto">
                {messages.common.cancel}
              </Button>
            </Drawer.Close>

            {header}
          </div>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
