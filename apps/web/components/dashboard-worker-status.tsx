'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@repo/ui/components/badge'
import { cn } from '@repo/ui/lib/utils'
import { LoaderCircleIcon } from 'lucide-react'

type Props = React.ComponentProps<'div'>
type Status = 'online' | 'offline' | 'checking'

export default function WorkerStatus({ className, ...props }: Props) {
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // TODO: Replace with actual health check endpoint
        const response = await fetch(
          'https://www.githubstatus.com/api/v2/status.json',
        )
        const data = await response.json()

        if (response.ok) {
          setStatus(data.status.indicator === 'none' ? 'online' : 'offline')
        } else {
          setStatus('offline')
        }
      } catch (error) {
        console.error('Health check failed:', error)
        setStatus('offline')
      }
    }

    checkStatus()
    const intervalId = setInterval(checkStatus, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const getBadgeVariant = (): 'default' | 'destructive' | 'secondary' => {
    switch (status) {
      case 'online':
        return 'default'
      case 'offline':
        return 'destructive'
      case 'checking':
      default:
        return 'secondary'
    }
  }

  return (
    <div {...props} className={cn('flex items-center capitalize', className)}>
      video worker status
      <Badge className="ml-2 flex items-center" variant={getBadgeVariant()}>
        {status === 'checking' && (
          <LoaderCircleIcon className="mr-1 h-3 w-3 animate-spin" />
        )}
        {status}
      </Badge>
    </div>
  )
}
