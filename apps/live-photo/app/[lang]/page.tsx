import { unstable_ViewTransition as ViewTransition } from 'react'
import { Link } from '@repo/i18n/client'
import { ParallaxItem } from '@repo/ui/components/parallax'

import ParallaxWithLenis from '#/components/parallax-with-lenis'
import { Search } from '#/components/search'

export default function Home() {
  return (
    <ParallaxWithLenis>
      <ParallaxItem asChild parallax="0.6">
        <h1 className="text-right text-9xl font-bold uppercase">coming soon</h1>
      </ParallaxItem>
      <Search />
    </ParallaxWithLenis>
  )
}
