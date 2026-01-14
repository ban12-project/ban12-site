'use client'

import { useRef } from 'react'
import { Link } from '@repo/i18n/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Plus } from 'lucide-react'

// Register GSAP plugins globally once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

export default function PostButton(
  props: Partial<React.ComponentProps<typeof Link>>,
) {
  const containerRef = useRef<HTMLAnchorElement>(null)

  // Use useGSAP for automatic cleanup and scoped selectors
  useGSAP(
    () => {
      if (!containerRef.current) return

      // Entrance animation timeline tied to scroll position
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: '20px top',
          toggleActions: 'play none none reverse',
        },
      })

      // Slide up from hidden state with a smooth elastic bounce
      tl.to(containerRef.current, {
        y: -16, // Float slightly above bottom
        opacity: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.6)',
      })

      // Pop the icon in after the container starts moving
      tl.from(
        'svg',
        {
          scale: 0.5,
          opacity: 0,
          rotate: -180,
          duration: 0.6,
          ease: 'back.out(2)',
        },
        '-=0.6',
      )
    },
    { scope: containerRef },
  )

  // Interaction-based animations using contextSafe for performance and hygiene
  const { contextSafe } = useGSAP({ scope: containerRef })

  const handleMouseEnter = contextSafe(() => {
    gsap.to(containerRef.current, {
      scale: 1.15,
      y: -20, // Extra lift on hover
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  })

  const handleMouseLeave = contextSafe(() => {
    gsap.to(containerRef.current, {
      scale: 1,
      y: -16,
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  })

  const handleMouseDown = contextSafe(() => {
    gsap.to(containerRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power3.out',
    })
  })

  const handleMouseUp = contextSafe(() => {
    gsap.to(containerRef.current, {
      scale: 1.15,
      duration: 0.2,
      ease: 'power3.out',
    })
  })

  return (
    <Link
      {...props}
      href="/post"
      scroll={false}
      className="left-safe-max-5 fixed bottom-0 z-50 flex h-14 w-14 translate-y-full transform opacity-0 items-center justify-center rounded-full bg-zinc-300/70 shadow-xl saturate-[180%] backdrop-blur-2xl transition-shadow dark:bg-zinc-700/70"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={containerRef}
    >
      <Plus
        className="h-7 w-7 text-zinc-900 dark:text-zinc-100"
        strokeWidth={3}
      />
    </Link>
  )
}

