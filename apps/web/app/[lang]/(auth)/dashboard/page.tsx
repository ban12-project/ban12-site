'use client'

import { useTransition } from 'react'
import { Button } from '@repo/ui/components/button'

import { videoUnderstanding } from '../actions'

export default function DashboardPage() {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      const text = await videoUnderstanding()
      console.log(text)
    })
  }

  return (
    <Button disabled={isPending} onClick={handleClick}>
      Dashboard
    </Button>
  )
}
