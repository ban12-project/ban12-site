'use client'

import {
  Suspense,
  use,
  useEffect,
  useRef,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import type { Player, PlayerProps } from 'livephotoskit'
import { toast } from 'sonner'

import { livePhotosKitModulePromise } from './live-photos-kit'

interface LivePhotoProps extends React.ComponentProps<'div'> {
  playerProps?: Partial<PlayerProps>
}

export default function WithSuspense(props: LivePhotoProps) {
  const onClick = async () => {
    const files = await Promise.all([
      (async () => {
        const url = props.playerProps!.photoSrc! as string
        const filename = url.split('/').pop() || 'image.jpeg'
        const res = await fetch(url)
        return new File([await res.blob()], filename, {
          type: res.headers.get('content-type') || 'image/jpeg',
        })
      })(),
      (async () => {
        const url = props.playerProps!.videoSrc! as string
        const filename = url.split('/').pop() || 'video.mov'
        const res = await fetch(url)
        return new File([await res.blob()], filename, {
          type: res.headers.get('content-type') || 'video/mp4',
        })
      })(),
    ])

    if (navigator.canShare({ files })) {
      navigator
        .share({
          files,
        })
        .catch((error) => {
          toast.error(error.message)
        })
    } else {
      toast.error('Your browser does not support sharing files.')
    }
  }

  return (
    <>
      <ViewTransition>
        <Suspense fallback={null}>
          <LivePhoto {...props} />
        </Suspense>
      </ViewTransition>
      <button onClick={onClick}>download</button>
    </>
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

    console.log(player.current.video)
  }, [])

  return <div {...props} ref={ref} />
}
