// https://gsap.com/community/forums/topic/39004-how-to-recreate-the-mouse-move-animation-on-the-httpsgsapcomresources-page/

'use client'

import { Children, isValidElement, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { cn } from '@repo/ui/lib/utils'
import { gsap } from 'gsap'
import { preload } from 'react-dom'

gsap.registerPlugin(useGSAP)

type Target = Window | HTMLElement

export default function FlairFollower({
  className,
  children,
  ref,
  target = () => window,
  ...props
}: React.ComponentProps<'div'> & {
  target?: Target | (() => Target) | React.RefObject<HTMLElement | null>
}) {
  Children.toArray(children).forEach((item) => {
    if (isValidElement(item)) {
      // item is a ReactElement, its props are in item.props
      // Retrieve the src attribute value if it exists and is a string
      const props = item.props as { src?: unknown } // Type assertion for props
      if (props && typeof props.src === 'string') {
        const srcValue: string = props.src
        // Assuming the intent is to preload the image, given the preload import
        preload(srcValue, { as: 'image' })
      }
    }
  })

  const [currentTarget, setCurrentTarget] = useState(() => {
    let currentTarget: Window | HTMLElement | null = null
    if (typeof target === 'function') {
      currentTarget = target() as Window | HTMLElement
    } else if (target && 'current' in target) {
      // It's a RefObject
      currentTarget = target.current
    } else {
      // It's Window or HTMLElement directly
      currentTarget = target as Window | HTMLElement
    }

    return currentTarget
  })

  useEffect(() => {
    // If the target is a passed ref, it should always be null because useGSAP internally uses useLayoutEffect.
    if (typeof target !== 'function' && 'current' in target) {
      setCurrentTarget(target.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const containerRef = useRef<React.ComponentRef<'div'>>(null)

  const mergeRefs = (el: React.ComponentRef<'div'>) => {
    if (typeof ref === 'function') ref(el)
    else if (ref != null) ref.current = el
    containerRef.current = el
  }

  useGSAP(
    (_context, contextSafe) => {
      const container = containerRef.current
      if (!container || !contextSafe || !currentTarget) return
      const flair = gsap.utils.toArray<HTMLImageElement>(container.children)
      const gap = 150
      let index = 0
      const wrapper = gsap.utils.wrap(0, flair.length)

      let mousePos = { x: 0, y: 0 }
      let lastMousePos = mousePos
      const cachedMousePos = mousePos

      const listener = (e: MouseEvent) => {
        mousePos = {
          x: e.x,
          y: e.y,
        }
      }

      currentTarget.addEventListener('mousemove', listener as EventListener)

      gsap.ticker.add(ImageTrail)

      function ImageTrail() {
        const travelDistance = Math.hypot(
          lastMousePos.x - mousePos.x,
          lastMousePos.y - mousePos.y,
        )

        // keep the previous mouse position for animation
        cachedMousePos.x = gsap.utils.interpolate(
          cachedMousePos.x || mousePos.x,
          mousePos.x,
          0.1,
        )
        cachedMousePos.y = gsap.utils.interpolate(
          cachedMousePos.y || mousePos.y,
          mousePos.y,
          0.1,
        )

        if (travelDistance > gap) {
          animateImage()
          lastMousePos = mousePos
        }
      }

      const animateImage = contextSafe(() => {
        const wrappedIndex = wrapper(index)

        const img = flair[wrappedIndex]
        gsap.killTweensOf(img)

        gsap.set(img, {
          opacity: 0,
          x: cachedMousePos.x,
          y: cachedMousePos.y,
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          rotation: () => gsap.utils.random([-180, 180]),
        })

        gsap
          .timeline({ defaults: { ease: 'expo.out', duration: 1 } })
          .to(
            img,
            {
              duration: 0.3,
              opacity: 1,
              scale: 1,
              ease: 'back.out',
              rotation: 0,
            },
            0,
          )
          .to(
            img,
            {
              x: mousePos.x,
              y: mousePos.y,
              xPercent: -50,
              yPercent: -50,
            },
            0,
          )
          .to(
            img,
            {
              rotation: () => gsap.utils.random([-600, 600, -300, 300]),
              ease: 'power3.in',
            },
            0.1,
          )
          .to(
            img,
            {
              opacity: 0,
              ease: 'power1.in',
              duration: 0.8,
            },
            0.4,
          )
          .to(
            img,
            {
              y: '100vh',
              ease: 'power3.inOut',
            },
            0.4,
          )

        index++
      })

      return () => {
        currentTarget.removeEventListener(
          'mousemove',
          listener as EventListener,
        )
        gsap.ticker.remove(ImageTrail)
      }
    },
    { scope: containerRef, dependencies: [currentTarget] },
  )

  return (
    <div
      aria-hidden="true"
      {...props}
      ref={mergeRefs}
      className={cn(
        'fixed left-0 top-0 [&>*]:fixed [&>*]:opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
