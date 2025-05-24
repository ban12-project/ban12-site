'use client'

import { Parallax } from '@repo/ui/components/parallax'
import Lenis from '@repo/ui/components/lenis'

export default function ParallaxWithLenis({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Parallax
      className="[&>div]:transform-3d h-screen overflow-y-scroll"
      asChild
      target={(target) =>
        (target as unknown as { wrapper: HTMLDivElement }).wrapper
      }
    >
      <Lenis>{children}</Lenis>
    </Parallax>
  )
}
