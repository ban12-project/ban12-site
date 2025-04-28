import { Fragment, unstable_ViewTransition as ViewTransition } from 'react'
import Link from 'next/link'

import type { Post } from '#/lib/api'
import { formatDate } from '#/lib/utils'

import Avatar from './avatar'
import GridContainer from './grid-container'

export default function Post({ posts }: { posts: Post[] }) {
  return (
    <div className="xl:max-w-5/6 relative mx-auto my-12 grid grid-cols-1 max-lg:max-w-2xl lg:my-24 lg:grid-cols-[24rem_2.5rem_minmax(0,1fr)]">
      {posts.map(({ date, author, slug, title, excerpt }, index) => (
        <Fragment key={slug}>
          <GridContainer className="p col-span-3 grid grid-cols-subgrid divide-x divide-gray-950/5 dark:divide-white/10">
            <div className="space-y-3 px-2 max-lg:hidden">
              <ViewTransition name={`date-${slug}`}>
                <div className="font-mono text-sm/6 font-medium uppercase tracking-widest text-gray-500">
                  {formatDate(date)}
                </div>
              </ViewTransition>
              <ViewTransition name={`avatar-${slug}`}>
                <Avatar name={author.name} picture={author.picture} />
              </ViewTransition>
            </div>
            <div className="max-lg:hidden" />
            <div className="text-md px-2">
              <div className="max-w-(--container-2xl)">
                <div className="mb-4 font-mono text-sm/6 font-medium uppercase tracking-widest text-gray-500 lg:hidden">
                  {formatDate(date)}
                </div>

                <ViewTransition name={`title-${slug}`}>
                  <Link href={`/posts/${slug}`} className="font-semibold">
                    {title}
                  </Link>
                </ViewTransition>
                <div className="prose prose-blog mt-4 line-clamp-3 leading-7">
                  {excerpt}
                </div>
                <Link
                  href={`/posts/${slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
                >
                  Read more
                </Link>
              </div>
            </div>
          </GridContainer>
          {index !== posts.length - 1 && (
            <div className="contents divide-x divide-gray-950/5 dark:divide-white/10">
              <div className="h-16 max-lg:hidden" />
              <div className="h-16 max-lg:hidden" />
              <div className="h-16" />
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
