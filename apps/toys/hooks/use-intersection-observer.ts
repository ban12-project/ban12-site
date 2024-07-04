import { useEffect } from 'react'

export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  target: React.RefObject<Element>,
  options?: IntersectionObserverInit,
) {
  useEffect(() => {
    if (!target.current) return

    const observer = new IntersectionObserver(callback, options)
    observer.observe(target.current)

    return () => {
      observer.disconnect()
    }
  }, [callback, options, target])
}
