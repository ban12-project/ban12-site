import { Skeleton } from './skeleton'

type AlbumListSkeletonProps = {
  num?: number
}

export default function AlbumListSkeleton({ num = 2 }: AlbumListSkeletonProps) {
  return (
    <div className="container-full">
      {[...Array<unknown>(num)].map((_, index) => (
        <div className="lg:pb-10" key={index}>
          <div className="pb-1.5">
            <div className="pb-2 pt-5 lg:hidden">
              <Skeleton className="h-6" />
            </div>
            <div className="py-0.5 lg:py-5">
              <Skeleton className="h-5 w-3/4 md:w-1/3 lg:h-9 lg:w-3/4" />
            </div>
          </div>
          <div className="flex h-[148px] gap-3 pb-5">
            <Skeleton className="h-full w-full rounded-3xl" />
            <Skeleton className="h-full w-full rounded-3xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
