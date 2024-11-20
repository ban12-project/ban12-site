'use client'

import { useMemo, useState } from 'react'
import type { Messages } from '#/lib/i18n'

import { cn } from '#/lib/utils'
import { useResponsive } from '#/hooks/use-responsive'
import PageDrawer, { PageDrawerProps } from '#/components/page-drawer'

type Drawer = {
  messages: Messages
  children?: React.ReactNode
}

const snapPoints = [0.7, 1]

export default function Drawer({ messages, children }: Drawer) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0])
  const breakpoints = useResponsive()

  const props: PageDrawerProps = useMemo(() => {
    const props = {
      messages,
      className: 'flex h-full flex-col',
      children,
    }

    // desktop
    if (breakpoints.lg) return props

    // mobile
    return {
      ...props,
      className: cn(props.className, 'max-h-[96%]'),
      snapPoints,
      fadeFromIndex: 0,
      activeSnapPoint: snap,
      setActiveSnapPoint: setSnap,
    }
  }, [breakpoints.lg, children, messages, snap])

  return <PageDrawer {...props} />
}
