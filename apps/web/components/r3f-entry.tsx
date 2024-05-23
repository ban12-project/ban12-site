'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./scene'), { ssr: false })

export default function R3fEntry() {
  const ref = useRef<HTMLBodyElement | null>(null)
  useEffect(() => {
    ref.current = document.querySelector('body')
  }, [])

  return (
    <Scene
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
      eventSource={ref as React.MutableRefObject<HTMLElement>}
      eventPrefix="client"
    />
  )
}
