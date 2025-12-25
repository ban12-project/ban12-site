'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@repo/ui/components/badge'
import { cn } from '@repo/ui/lib/utils'
import { LoaderCircleIcon } from 'lucide-react'

type Props = React.ComponentProps<'div'>
type Status = 'online' | 'offline' | 'checking'

const WORKERS = [
  {
    id: 'clawcloud',
    name: 'ClawCloud',
    url: 'https://lacvbsobpuxp.ap-southeast-1.clawcloudrun.com/ready',
  },
  {
    id: 'render',
    name: 'Render',
    url: 'https://video-worker-latest.onrender.com/ready',
  },
]

export default function WorkerStatus({ className, ...props }: Props) {
  const [statuses, setStatuses] = useState<Record<string, Status>>(() =>
    Object.fromEntries(WORKERS.map((w) => [w.id, 'checking'])),
  )

  useEffect(() => {
    const checkStatus = async (id: string, url: string) => {
      try {
        const response = await fetch(url)
        const data = await response.json()

        if (response.ok) {
          setStatuses((prev) => ({
            ...prev,
            [id]: data.status === 'ok' ? 'online' : 'offline',
          }))
        } else {
          setStatuses((prev) => ({ ...prev, [id]: 'offline' }))
        }
      } catch (error) {
        console.error(`Health check failed for ${id}:`, error)
        setStatuses((prev) => ({ ...prev, [id]: 'offline' }))
      }
    }

    const checkAll = () => {
      WORKERS.forEach((worker) => checkStatus(worker.id, worker.url))
    }

    checkAll()
    const intervalId = setInterval(checkAll, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const getBadgeVariant = (
    status: Status,
  ): 'default' | 'destructive' | 'secondary' => {
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
    <div
      {...props}
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}
    >
      <span className="text-sm font-medium text-muted-foreground">
        Workers:
      </span>
      {WORKERS.map((worker) => {
        const status = statuses[worker.id] ?? 'checking'
        return (
          <div key={worker.id} className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{worker.name}</span>
            <Badge
              className="px-1.5 py-0 text-[10px] capitalize"
              variant={getBadgeVariant(status)}
            >
              {status === 'checking' && (
                <LoaderCircleIcon className="mr-1 h-2.5 w-2.5 animate-spin" />
              )}
              {status}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}
