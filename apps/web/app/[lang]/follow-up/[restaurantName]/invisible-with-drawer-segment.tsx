'use client'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '@repo/ui/lib/utils'

import { useLayoutSegment } from '#/components/layout-segment-context'

export interface InvisibleWithDrawerSegmentProps
  extends React.ComponentProps<'div'> {
  asChild?: boolean
}

export default function InvisibleWithDrawerSegment({
  className,
  asChild = false,
  ...props
}: InvisibleWithDrawerSegmentProps) {
  const Comp = asChild ? Slot : 'div'

  const segment = useLayoutSegment()
  const invisible = !!segment

  return (
    <Comp
      data-slot="invisible-with-drawer-segment"
      className={cn(className, invisible ? 'hidden' : '')}
      {...props}
    />
  )
}
