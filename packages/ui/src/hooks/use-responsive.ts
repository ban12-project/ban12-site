import { useEffect, useState, useLayoutEffect } from 'react'

/** https://tailwindcss.com/docs/screens */
interface Breakpoints {
  /** (min-width: 640px) This will only center text on screens 640px and wider, not on small screens */
  sm: boolean
  /** (min-width: 768px) */
  md: boolean
  /** (min-width: 1024px) */
  lg: boolean
  /** (min-width: 1280px) */
  xl: boolean
  /** (min-width: 1536px) */
  '2xl': boolean
}

interface WithIsReady<T> {
  isReady: boolean
  breakpoints: T
}

export function useResponsive(): WithIsReady<Breakpoints>
export function useResponsive<U>(selector: (breakpoints: Breakpoints) => U): WithIsReady<U>
export function useResponsive<U>(selector?: (breakpoints: Breakpoints) => U) {
  const [breakpoints, setBreakpoints] = useState({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  })
  const [isReady, setIsReady] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const onResize = () => {
      // tailwindcss responsive breakpoints
      // https://tailwindcss.com/docs/responsive-design
      setBreakpoints({
        sm: window.matchMedia('(min-width: 640px)').matches,
        md: window.matchMedia('(min-width: 768px)').matches,
        lg: window.matchMedia('(min-width: 1024px)').matches,
        xl: window.matchMedia('(min-width: 1280px)').matches,
        '2xl': window.matchMedia('(min-width: 1536px)').matches,
      })

      setIsReady(true)
    }

    onResize()
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return {
    isReady,
    breakpoints: selector ? selector(breakpoints) : breakpoints
  }
}

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect
