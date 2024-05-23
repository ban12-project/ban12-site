'use client'

import { forwardRef, Suspense, useImperativeHandle, useRef } from 'react'
import {
  OrbitControls,
  PerspectiveCamera,
  View as ViewImpl,
} from '@react-three/drei'
import type { ColorRepresentation } from 'three'

import { Three } from './three'

type CommonProps = { color?: ColorRepresentation }

export const Common = ({ color }: CommonProps) => (
  <Suspense fallback={null}>
    {color && <color attach="background" args={[color]} />}
    <ambientLight />
    <pointLight position={[20, 30, 10]} intensity={3} decay={0.2} />
    <pointLight position={[-10, -10, -10]} color="blue" decay={0.2} />
    <PerspectiveCamera makeDefault fov={40} position={[0, 0, 6]} />
  </Suspense>
)

type ViewProps = React.HTMLAttributes<HTMLDivElement> & {
  orbit?: boolean
}

const View = forwardRef<HTMLElement, ViewProps>(
  ({ children, orbit, ...props }, ref) => {
    const localRef = useRef<React.ElementRef<'div'>>(null)
    useImperativeHandle(ref, () => localRef.current as HTMLElement)

    return (
      <>
        <div ref={localRef} {...props} />
        <Three>
          <ViewImpl track={localRef as React.MutableRefObject<HTMLElement>}>
            {children}
            {orbit && <OrbitControls />}
          </ViewImpl>
        </Three>
      </>
    )
  },
)
View.displayName = 'View'

export { View }
