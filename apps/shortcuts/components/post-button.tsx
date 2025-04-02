'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Link } from '@repo/i18n/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { Plus } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function PostButton(
  props: Partial<React.ComponentProps<typeof Link>>,
) {
  const containerRef = useRef<HTMLAnchorElement>(null)

  useGSAP(
    (context, contextSafe) => {
      if (!containerRef.current) return

      const onEnter = contextSafe!(() => {
        gsap.to(containerRef.current, {
          duration: 1,
          y: '-20px',
          ease: 'elastic.out(1,0.4)',
          overwrite: true,
        })

        gsap.fromTo(
          'svg',
          {
            y: '20%',
          },
          {
            y: 0,
            duration: 1,
            delay: 0.2,
            ease: 'elastic.out(1,0.4)',
            overwrite: true,
          },
        )
      })

      const onLeaveBack = contextSafe!(() => {
        gsap.to(containerRef.current, {
          duration: 0.2,
          y: '100%',
          overwrite: true,
        })
      })

      const st = ScrollTrigger.create({
        trigger: document.documentElement,
        start: '20px top',
        onEnter,
        onLeaveBack,
      })

      return () => {
        st.kill()
      }
    },
    { scope: containerRef },
  )

  return (
    <Link
      {...props}
      href="/post"
      scroll={false}
      className="left-safe-max-5 fixed bottom-0 flex h-12 w-12 translate-y-full transform items-center justify-center rounded-full bg-zinc-300/70 saturate-[180%] backdrop-blur-[20px] backdrop-filter dark:bg-zinc-700/70"
      ref={containerRef}
    >
      <Plus strokeWidth="4" />
    </Link>
  )
}
