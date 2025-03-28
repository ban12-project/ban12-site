'use client'

import { Button } from '@repo/ui/components/button'
import { Share } from 'lucide-react'

import useWebShare from '#/hooks/use-web-share'

export default function ShareButton() {
  const { share } = useWebShare()

  return (
    <Button
      variant="ios"
      size="auto"
      className="text-blue-500 active:text-blue-500/80 [&_svg]:size-6"
      onClick={() => share()}
    >
      <Share />
    </Button>
  )
}
