'use client'

import {
  Suspense,
  use,
  useEffect,
  useImperativeHandle,
  useRef,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import Script from 'next/script'
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

type LivePhotosKit = typeof import('livephotoskit')

declare global {
  interface Window {
    LivePhotosKit: LivePhotosKit
  }
}

interface LivePhotoProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
  ref?: React.Ref<Player>
  playerProps?: Partial<PlayerProps>
  messages: Messages
  externalScript: Promise<LivePhotosKit>
}

export const livePhotosKitResourcesPromise = () =>
  new Promise<LivePhotosKit>((resolve) => {
    if (window.LivePhotosKit) resolve(window.LivePhotosKit)

    const listener = () => {
      resolve(window.LivePhotosKit)
      document.removeEventListener('livephotoskitloaded', listener)
    }

    // https://developer.apple.com/documentation/livephotoskitjs/livephotoskit/livephotoskit_loaded
    document.addEventListener('livephotoskitloaded', listener)
  })

export function Loader() {
  return (
    <Script
      id="apple-livephotoskit"
      strategy="afterInteractive"
      src="https://cdn.apple-livephotoskit.com/lpk/1/livephotoskit.js"
      crossOrigin="anonymous"
    />
  )
}

export default function WithSuspense({
  className,
  messages,
  ...props
}: Omit<LivePhotoProps, 'externalScript'>) {
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
    <div
      className={cn(
        className,
        'relative [&>*]:data-[load-progress="1"]:[&+*]:visible',
      )}
    >
      <Loader />
      <ViewTransition>
        <Suspense
          fallback={
            <LoaderCircleIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          }
        >
          <LivePhoto
            externalScript={livePhotosKitResourcesPromise()}
            {...props}
            className="h-full"
          />
        </Suspense>
      </ViewTransition>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="link"
              className="invisible absolute bottom-0 right-0 z-[4]"
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
  externalScript,
  ...props
}: Omit<LivePhotoProps, 'messages'>) {
  const LivePhotosKit = use(externalScript)
  const container = useRef<React.ComponentRef<'div'>>(null)
  const player = useRef<Player>(null)

  useEffect(() => {
    if (!container.current) return

    player.current = LivePhotosKit.augmentElementAsPlayer(
      container.current,
      playerProps,
    )
  }, [])

  useImperativeHandle(props.ref, () => player.current as Player)

  return <div {...props} ref={container} />
}
