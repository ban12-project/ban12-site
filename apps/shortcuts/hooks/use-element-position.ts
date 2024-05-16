import { useEffect, useState } from 'react'

export function useElementPosition<T>(
  elementRef: React.RefObject<T extends HTMLElement ? T : null>,
) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const handleResize = () => {
      if (!elementRef.current) return
      const { top, left } = getAbsolutePosition(elementRef.current)
      setPosition({ top, left })
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [elementRef])

  return position
}

function getAbsolutePosition(element: HTMLElement) {
  let top = 0,
    left = 0
  while (element) {
    top += element.offsetTop
    left += element.offsetLeft
    element = element.offsetParent as HTMLElement
  }
  return { top, left }
}
