import { useEffect } from 'react'
import { useRafState } from 'ahooks'

import { IN_BROWSER } from '#/lib/utils'

export function useWindowSize(
  initialWidth = Infinity,
  initialHeight = Infinity,
) {
  const [state, setState] = useRafState({
    width: IN_BROWSER ? window.innerWidth : initialWidth,
    height: IN_BROWSER ? window.innerHeight : initialHeight,
  })

  useEffect(() => {
    const onResize = () => {
      setState({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', onResize, false)

    return () => {
      window.removeEventListener('resize', onResize, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
