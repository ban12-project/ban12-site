'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@repo/ui/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

const switchRootVariants = cva(
  'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-slate-200 dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950 dark:data-[state=checked]:bg-slate-50 dark:data-[state=unchecked]:bg-slate-800',
        ios: 'data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-slate-200 dark:data-[state=checked]:bg-slate-50 dark:data-[state=unchecked]:bg-slate-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const switchThumbVariants = cva(
  'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
  {
    variants: {
      variant: {
        default: 'dark:bg-slate-950',
        ios: 'dark:bg-slate-950',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchRootVariants>,
    VariantProps<typeof switchThumbVariants> {}

const Switch = (
  {
    ref,
    className,
    variant,
    ...props
  }: SwitchProps & {
    ref: React.RefObject<React.ComponentRef<typeof SwitchPrimitives.Root>>;
  }
) => (<SwitchPrimitives.Root
  className={cn(
    switchRootVariants({
      variant,
      className,
    }),
  )}
  {...props}
  ref={ref}
>
  <SwitchPrimitives.Thumb
    className={cn(
      switchThumbVariants({
        variant,
      }),
    )}
  />
</SwitchPrimitives.Root>)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
