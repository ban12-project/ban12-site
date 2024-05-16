import AlbumListSkeleton from '#/components/ui/album-list-skeleton'
import { Skeleton } from '#/components/ui/skeleton'

export default function Loading() {
  return (
    <>
      <div className="container-full pb-5 pt-safe-max-4">
        <Skeleton className="h-9 w-full" />
      </div>
      <div>
        <AlbumListSkeleton num={3} />
      </div>
    </>
  )
}
