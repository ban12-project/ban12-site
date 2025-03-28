import { Skeleton } from '@repo/ui/components/skeleton'

export default function Loading() {
  return (
    <div className="container-full pt-safe-max-4">
      <Skeleton className="h-9 w-1/3" />
      <div className="grid grid-cols-1 gap-3 pt-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3 2xl:grid-cols-4">
        <div className="flex h-32">
          <Skeleton className="h-full w-[calc((100%-0.75rem)/2)] rounded-3xl" />
          <div className="ml-3 flex-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
        <div className="flex h-32">
          <Skeleton className="h-full w-[calc((100%-0.75rem)/2)] rounded-3xl" />
          <div className="ml-3 flex-1 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
