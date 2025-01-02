'use client'

import 'lenis/dist/lenis.css'

import { useEffect, useLayoutEffect } from 'react'
import Tempus from '@darkroom.engineering/tempus'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger'
import { ReactLenis, useLenis } from 'lenis/react'

interface Props extends React.ComponentProps<typeof ReactLenis> {
  children?: React.ReactNode
  gsap?: boolean
  scrollTrigger?: boolean
}

function ScrollTriggerConfig() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, useGSAP as object)
    ScrollTrigger.clearScrollMemory('manual')
    ScrollTrigger.defaults({
      markers: process.env.NODE_ENV === 'development',
    })
  }, [])

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const lenis = useLenis(ScrollTrigger.update)
  useEffect(() => ScrollTrigger.refresh(), [lenis])

  return null
}

function GSAPIntergration({ scrollTrigger = false }) {
  useLayoutEffect(() => {
    gsap.defaults({ ease: 'none' })

    // merge rafs
    gsap.ticker.lagSmoothing(0)
    gsap.ticker.remove(gsap.updateRoot)
    Tempus?.add((time: number) => {
      gsap.updateRoot(time / 1000)
    }, 0)
  }, [])

  return scrollTrigger && <ScrollTriggerConfig />
}

export default function Lenis({
  children,
  gsap,
  scrollTrigger,
  ...props
}: Props) {
  return (
    <>
      {gsap && <GSAPIntergration scrollTrigger={scrollTrigger} />}
      <ReactLenis {...props}>{children}</ReactLenis>
    </>
  )
}
