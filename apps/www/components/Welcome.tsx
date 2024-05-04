'use client'

import React, { useEffect, useState } from 'react'
import type { Messages } from '@/i18n'
import { animated, useTrail } from '@react-spring/web'

type Props = { open: boolean; children: React.ReactNode }

const Trail: React.FC<Props> = ({ open, children }) => {
  const items = React.Children.toArray(children)
  const [trail, api] = useTrail(
    items.length,
    {
      opacity: 0,
      x: 20,
      height: 0,
    },
    [],
  )

  useEffect(() => {
    api.start({
      config: { mass: 5, tension: 2000, friction: 200 },
      height: open ? 128 : 0,
      opacity: open ? 1 : 0,
      x: open ? 0 : 20,
    })

    return () => {
      api.stop(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div className="text-7xl font-extrabold text-gray-900 md:text-9xl dark:text-pink-100">
      {trail.map(({ height, ...style }, index) => (
        <animated.div
          key={index}
          style={{
            ...style,
            willChange: 'transform, opacity',
            lineHeight: '120px',
            height: '120px',
          }}
          className="relative overflow-hidden"
        >
          <animated.div style={{ height }} className="overflow-hidden">
            {items[index]}
          </animated.div>
        </animated.div>
      ))}
    </div>
  )
}

export default function Welcome({ messages }: { messages: Messages }) {
  const [open, setOpen] = useState(true)

  return (
    <div
      className="flex h-screen items-center justify-center"
      onClick={() => setOpen((state) => !state)}
    >
      <Trail open={open}>{messages['under-construction'].split(' ')}</Trail>
    </div>
  )
}
