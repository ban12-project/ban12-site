import { useEffect, useState } from 'react'

type Direction = 'ltr' | 'rtl'

export default function useRootDirection(): Direction
export default function useRootDirection<P>(transform: (dir: Direction) => P): P
export default function useRootDirection<R>(transform?: (dir: Direction) => R) {
  const [direction, setDirection] = useState<Direction>('ltr')

  useEffect(() => {
    const direction = document
      .querySelector('html')!
      .getAttribute('dir') as Direction
    setDirection(direction)
  }, [])

  return typeof transform === 'function' ? transform(direction) : direction
}
