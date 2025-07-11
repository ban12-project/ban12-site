'use client'

import 'lenis/dist/lenis.css'

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis, useLenis, type LenisRef } from 'lenis/react'
import Tempus from 'tempus'
import { useTempus } from 'tempus/react'

interface Props extends React.ComponentProps<typeof ReactLenis> {
  children?: React.ReactNode
  /**
   * gsap integration
   */
  gsap?: boolean
  /**
   * gsap ScrollTrigger integration
   */
  scrollTrigger?: boolean
}

function ScrollTriggerConfig() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.clearScrollMemory('manual')
    ScrollTrigger.defaults({
      markers: process.env.NODE_ENV === 'development',
    })
  }, [])

  const lenis = useLenis(ScrollTrigger.update)
  useEffect(() => ScrollTrigger.refresh(), [lenis])

  return null
}

function GSAPIntergration({
  scrollTrigger = false,
}: {
  scrollTrigger?: boolean
}) {
  useLayoutEffect(() => {
    gsap.defaults({ ease: 'none' })

    // merge rafs
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.remove(gsap.updateRoot)
    Tempus?.add((time: number) => {
      gsap.updateRoot(time / 1000)
    })
  }, [])

  return scrollTrigger && <ScrollTriggerConfig />
}

export default function Lenis({
  children,
  gsap,
  scrollTrigger,
  ref,
  options,
  ...props
}: Props) {
  const lenisRef = useRef<LenisRef>(null)

  useTempus((time: number) => {
    if (lenisRef.current?.lenis) {
      lenisRef.current.lenis.raf(time)
    }
  })

  const mergeRefs = useCallback(
    (el: LenisRef) => {
      if (typeof ref === 'function') ref(el)
      else if (ref != null) ref.current = el
      lenisRef.current = el
    },
    [ref],
  )

  return (
    <>
      {gsap && <GSAPIntergration scrollTrigger={scrollTrigger} />}
      <ReactLenis
        {...props}
        ref={mergeRefs}
        options={{
          ...options,
          autoRaf: false,
        }}
      >
        {children}
      </ReactLenis>
    </>
  )
}
