import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

import { cn } from '#/lib/utils'

type Props = {
  title: string
  src: string
  slug?: string
} & Pick<ImageProps, 'priority'>

const CoverImage = ({ title, src, slug, priority }: Props) => {
  const image = (
    <Image
      src={src}
      alt={`Cover Image for ${title}`}
      className={cn('aspect-[2/1] w-full shadow-sm', {
        'transition-shadow duration-200 hover:shadow-lg': slug,
      })}
      width={1300}
      height={650}
      priority={priority}
    />
  )
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link as={`/posts/${slug}`} href="/posts/[slug]" aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  )
}

export default CoverImage
