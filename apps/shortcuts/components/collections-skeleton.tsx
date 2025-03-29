import { Skeleton } from '@repo/ui/components/skeleton'

export default function collectionsSkeleton() {
  return (
    <div className="container-full pb-10 pt-2.5 lg:pb-20">
      <Skeleton className="aspect-4/5 rounded-2xl md:h-[500px] md:w-full" />
    </div>
  )
}
