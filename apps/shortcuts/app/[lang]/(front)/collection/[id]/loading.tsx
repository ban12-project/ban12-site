import { Skeleton } from '@repo/ui/components/skeleton'

import AlbumListSkeleton from '#/components/album-list-skeleton'

export default function Loading() {
  return (
    <>
      <div className="container-full pt-safe-max-4 pb-5">
        <Skeleton className="h-9 w-full" />
      </div>
      <div>
        <AlbumListSkeleton num={3} />
      </div>
    </>
  )
}
