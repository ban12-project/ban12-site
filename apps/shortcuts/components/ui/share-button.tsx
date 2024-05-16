'use client'

import { Share } from 'lucide-react'

import useWebShare from '#/hooks/use-web-share'

import { Button } from './button'

export default function ShareButton() {
  const { share } = useWebShare()

  return (
    <Button
      variant="ios"
      size="auto"
      className="text-blue-500 active:text-blue-500/80"
      onClick={() => share()}
    >
      <Share />
    </Button>
  )
}
