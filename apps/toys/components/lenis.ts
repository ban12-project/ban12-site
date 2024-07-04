'use client'

import './lenis.css'

import { DependencyList, useEffect } from 'react'
import { useIsomorphicLayoutEffect } from 'ahooks'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { create } from 'zustand'

import { useResponsive } from '#/hooks/use-responsive'

interface LenisState {
  lenis: Lenis | null
  setLenis: (lenis: Lenis | null) => void
}

const useStore = create<LenisState>((set) => ({
  lenis: null,
  setLenis: (lenis) => set({ lenis }),
}))

export function useLenis(
  callback: (lenis: Lenis) => void,
  deps: DependencyList = [],
) {
  const lenis = useStore((state) => state.lenis)

  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', callback)
    // lenis.emit()

    return () => {
      lenis.off('scroll', callback)
    }
  }, [lenis, callback, deps])

  return lenis
}

export default function LenisMount({
  children,
}: {
  children: React.ReactNode
}) {
  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])
  const isDesktop = useResponsive((breakpoint) => breakpoint.md)

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.defaults({
      markers: process.env.NODE_ENV === 'development',
    })
  }, [])
  useLenis(ScrollTrigger.update)

  useEffect(() => {
    if (!lenis) return
    ScrollTrigger.refresh()
    lenis.start()
  }, [lenis])

  useEffect(() => {
    if (!isDesktop) return

    const lenis = new Lenis()
    setLenis(lenis)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [isDesktop, setLenis])

  return children
}
