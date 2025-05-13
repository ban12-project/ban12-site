import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { Slot } from '@radix-ui/react-slot'
import { gsap } from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'

gsap.registerPlugin(useGSAP, ScrambleTextPlugin)

// Utilities for building random strings
// const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?~'
const _defaultChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

type Trigger = keyof HTMLElementEventMap | 'mounted'

export default function ScrambleText({
  ref,
  asChild,
  defaultChars = _defaultChars,
  trigger = ['pointerenter', 'focus'],
  disableResizeObserver = false,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
  defaultChars?: string
  trigger?: Trigger | Trigger[]
  disableResizeObserver?: boolean
}) {
  const Comp = asChild ? Slot : 'div'
  const containerRef = useRef<React.ComponentRef<'div'>>(null)

  useGSAP(
    (context, contextSafe) => {
      const container = containerRef.current
      if (!container) return
      if (!contextSafe) return

      const scramble = contextSafe(() => {
        if (
          gsap.isTweening(container) ||
          !window.matchMedia('(prefers-reduced-motion: no-preference)').matches
        )
          return

        gsap.to(container, {
          duration: 0.8,
          ease: 'sine.in',
          scrambleText: {
            text: container.innerText,
            speed: 2,
            chars: defaultChars,
          },
        })
      })

      const events = typeof trigger === 'string' ? [trigger] : trigger
      if (events.includes('mounted')) scramble()
      const eventsWithoutMounted = events.filter((e) => e !== 'mounted')
      eventsWithoutMounted.forEach((event) => {
        container.addEventListener(event, scramble)
      })

      return () => {
        eventsWithoutMounted.forEach((event) => {
          container.removeEventListener(event, scramble)
        })
      }
    },
    { dependencies: [defaultChars, trigger], scope: containerRef },
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || disableResizeObserver) return
    const observer = new ResizeObserver(() => {
      if (gsap.isTweening(container)) return
      container.style.removeProperty('width')
      container.style.removeProperty('height')

      const { width, height } = container.getBoundingClientRect()
      container.style.setProperty('width', `${width}px`)
      container.style.setProperty('height', `${height}px`)
    })

    observer.observe(container.parentElement || document.documentElement)

    return () => observer.disconnect()
  }, [disableResizeObserver])

  const mergeRefs = (el: React.ComponentRef<'div'>) => {
    if (typeof ref === 'function') ref(el)
    else if (ref != null) ref.current = el
    containerRef.current = el
  }

  return <Comp aria-hidden="true" {...props} ref={mergeRefs} />
}
