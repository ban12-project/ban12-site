'use client'

import { useRef } from 'react'
import { useUpdateEffect } from 'ahooks'

interface Icon extends React.SVGAttributes<SVGElement> {
  open?: boolean
}

export default function MenuIcon({ open = false, ...props }: Icon) {
  const openBottom = useRef<SVGAnimateElement>(null)
  const openTop = useRef<SVGAnimateElement>(null)
  const closeBottom = useRef<SVGAnimateElement>(null)
  const closeTop = useRef<SVGAnimateElement>(null)

  useUpdateEffect(() => {
    if (open) {
      openBottom.current?.beginElement()
      openTop.current?.beginElement()
    } else {
      closeBottom.current?.beginElement()
      closeTop.current?.beginElement()
    }
  }, [open])

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" {...props}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="2 12, 16 12"
      >
        <animate
          ref={openBottom}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 2 12, 16 12; 2 9, 16 9; 3.5 15, 15 3.5"
        ></animate>
        <animate
          ref={closeBottom}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 3.5 15, 15 3.5; 2 9, 16 9; 2 12, 16 12"
        ></animate>
      </polyline>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points="2 5, 16 5"
      >
        <animate
          ref={openTop}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 2 5, 16 5; 2 9, 16 9; 3.5 3.5, 15 15"
        ></animate>
        <animate
          ref={closeTop}
          attributeName="points"
          keyTimes="0;0.5;1"
          dur="0.24s"
          begin="indefinite"
          fill="freeze"
          calcMode="spline"
          keySplines="0.42, 0, 1, 1;0, 0, 0.58, 1"
          values=" 3.5 3.5, 15 15; 2 9, 16 9; 2 5, 16 5"
        ></animate>
      </polyline>
    </svg>
  )
}
