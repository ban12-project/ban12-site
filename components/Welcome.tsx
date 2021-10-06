import React, { useState } from 'react'
import { animated, useTrail } from '@react-spring/web'
import { useIntl } from 'react-intl'

const Trail: React.FC<{ open: boolean }> = ({ open, children }) => {
  const items = React.Children.toArray(children)
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 2000, friction: 200 },
    opacity: open ? 1 : 0,
    x: open ? 0 : 20,
    height: open ? 128 : 0,
    from: { opacity: 0, x: 20, height: 0 },
  })

  return (
    <div className="text-gray-900 dark:text-pink-100 font-extrabold md:text-9xl text-7xl">
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

export default function Welcome() {
  const intl = useIntl()
  const [open, setOpen] = useState(true)

  return (
    <div
      className="h-screen flex items-center justify-center"
      onClick={() => setOpen(state => !state)}
    >
      <Trail open={open}>
        {intl
          .formatMessage({
            description: '施工中',
            defaultMessage: 'Under construction',
          })
          .split(' ')}
      </Trail>
    </div>
  )
}
