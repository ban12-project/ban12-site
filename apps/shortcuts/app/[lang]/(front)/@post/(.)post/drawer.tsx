'use client'

import { useState } from 'react'
import type { Messages } from '#/i18n'

import { useResponsive } from '#/hooks/use-responsive'
import PageDrawer from '#/components/ui/page-drawer'

type Drawer = {
  messages: Messages
  children?: React.ReactNode
}

const snapPoints = [0.7, 1]

export default function Drawer({ messages, children }: Drawer) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0])
  const breakpoints = useResponsive()

  return breakpoints.lg ? (
    <PageDrawer messages={messages} className="flex h-full flex-col">
      {children}
    </PageDrawer>
  ) : (
    <PageDrawer
      snapPoints={snapPoints}
      fadeFromIndex={0}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      messages={messages}
      className="flex h-full max-h-[96%] flex-col"
    >
      {children}
    </PageDrawer>
  )
}
