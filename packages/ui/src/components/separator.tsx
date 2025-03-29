'use client'

import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '@repo/ui/lib/utils'

const Separator = (
  {
    ref,
    className,
    orientation = 'horizontal',
    decorative = true,
    ...props
  }: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
    ref: React.RefObject<React.ElementRef<typeof SeparatorPrimitive.Root>>;
  }
) => (<SeparatorPrimitive.Root
  ref={ref}
  decorative={decorative}
  orientation={orientation}
  className={cn(
    'shrink-0 bg-slate-200 dark:bg-slate-800',
    orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
    className,
  )}
  {...props}
/>)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
