'use client'

import {
  Suspense,
  use,
  useEffect,
  useRef,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import type { Player, PlayerProps } from 'livephotoskit'

import { livePhotosKitModulePromise } from './live-photos-kit'

interface LivePhotoProps extends React.ComponentProps<'div'> {
  playerProps?: Partial<PlayerProps>
}

export default function WithSuspense(props: LivePhotoProps) {
  return (
    <ViewTransition>
      <Suspense fallback={null}>
        <LivePhoto {...props} />
      </Suspense>
    </ViewTransition>
  )
}

function LivePhoto({ playerProps, ...props }: LivePhotoProps) {
  const LivePhotosKit = use(livePhotosKitModulePromise)
  const ref = useRef<React.ComponentRef<'div'>>(null)
  const player = useRef<Player>(null)

  useEffect(() => {
    if (!LivePhotosKit || !ref.current) return

    player.current = LivePhotosKit.augmentElementAsPlayer(
      ref.current,
      playerProps,
    )
  }, [])

  return <div {...props} ref={ref} />
}
