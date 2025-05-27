'use client'

import {
  Suspense,
  use,
  useEffect,
  useImperativeHandle,
  useRef,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import { Button } from '@repo/ui/components/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/tooltip'
import { cn } from '@repo/ui/lib/utils'
import type { Player, PlayerProps } from 'livephotoskit'
import { DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

import type { Messages } from '#/lib/i18n'

import { livePhotosKitModulePromise } from './live-photos-kit'

interface LivePhotoProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
  ref?: React.Ref<Player>
  playerProps?: Partial<PlayerProps>
  messages: Messages
}

export default function WithSuspense({
  className,
  messages,
  ...props
}: LivePhotoProps) {
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
          type: res.headers.get('content-type') || 'video/quicktime',
        })
      })(),
    ])

    if (navigator.canShare?.({ files })) {
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
    <div className={cn(className, 'relative [&>*]:data-[load-progress="1"]:[&+*]:visible')}>
      <Suspense>
        <LivePhoto {...props} className="h-full">
          <LoaderCircleIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
        </LivePhoto>
      </Suspense>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="link"
              className="absolute bottom-0 right-0 z-[4] invisible"
              onClick={onClick}
            >
              <DownloadIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {messages['download-tips'].map((tip, index) => (
              <p key={index}>{tip}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function LivePhoto({
  playerProps,
  ...props
}: Omit<LivePhotoProps, 'messages'>) {
  const LivePhotosKit = use(livePhotosKitModulePromise)
  const container = useRef<React.ComponentRef<'div'>>(null)
  const player = useRef<Player>(null)

  useEffect(() => {
    if (!LivePhotosKit || !container.current) return

    player.current = LivePhotosKit.augmentElementAsPlayer(
      container.current,
      playerProps,
    )
  }, [])

  useImperativeHandle(props.ref, () => player.current as Player)

  return <div {...props} ref={container} />
}
