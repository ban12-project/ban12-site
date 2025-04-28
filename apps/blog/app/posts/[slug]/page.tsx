import { unstable_ViewTransition as ViewTransition } from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAllPosts, getPostBySlug } from '#/lib/api'
import markdownToHtml from '#/lib/markdownToHtml'
import { formatDate } from '#/lib/utils'
import Avatar from '#/components/avatar'
import GridContainer from '#/components/grid-container'

export default async function Post(props: Params) {
  const params = await props.params
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return notFound()
  }

  const content = await markdownToHtml(post.content || '')

  return (
    <div className="xl:max-w-5/6 mx-auto grid grid-cols-1 xl:grid-cols-[22rem_2.5rem_auto] xl:grid-rows-[1fr_auto]">
      <div className="col-start-2 row-span-2 border-l border-r border-gray-950/5 max-xl:hidden dark:border-white/10"></div>

      <div className="max-xl:max-w-(--breakpoint-md) max-xl:mx-auto max-xl:w-full">
        <div className="mt-16 px-4 font-mono text-sm/7 font-medium uppercase tracking-widest text-gray-500 lg:px-2">
          <ViewTransition name={`date-${post.slug}`}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </ViewTransition>
        </div>

        <GridContainer className="mb-6 px-4 lg:px-2 xl:mb-16">
          <ViewTransition name={`title-${post.slug}`}>
            <h1 className="max-w-(--breakpoint-md) inline-block text-pretty text-[2.5rem]/10 tracking-tight text-gray-950 max-lg:font-medium lg:text-6xl dark:text-gray-200">
              {post.title}
            </h1>
          </ViewTransition>
        </GridContainer>
      </div>

      <div className="max-xl:max-w-(--breakpoint-md) max-xl:mx-auto max-xl:w-full">
        <div className="flex flex-col gap-4">
          <GridContainer
            direction="to-left"
            className="max-xl:before:-left-[100vw]! max-xl:after:-left-[100vw]! flex items-center whitespace-nowrap px-4 py-2 font-medium xl:px-2 xl:before:hidden"
          >
            <ViewTransition name={`avatar-${post.slug}`}>
              <Avatar name={post.author.name} picture={post.author.picture} />
            </ViewTransition>
          </GridContainer>
        </div>
      </div>

      <div className="max-xl:max-w-(--breakpoint-md) max-xl:mx-auto max-xl:mt-16 max-xl:w-full">
        <GridContainer className="px-4 py-2 lg:px-2">
          <article
            className="prose prose-blog max-w-(--breakpoint-md)"
            dangerouslySetInnerHTML={{ __html: content }}
          ></article>
        </GridContainer>
      </div>

      <link
        rel="stylesheet"
        href="https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/highlight.js/11.11.1/styles/github.min.css"
        media="(prefers-color-scheme: light)"
        integrity="sha512-0aPQyyeZrWj9sCA46UlmWgKOP0mUipLQ6OZXu8l4IcAmD2u31EPEy9VcIMvl7SoAaKe8bLXZhYoMaE/in+gcgA=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      <link
        rel="stylesheet"
        href="https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css"
        media="(prefers-color-scheme: dark)"
        integrity="sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw=="
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}

type Params = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return notFound()
  }

  const title = `${post.title}`

  return {
    title,
    description: post.excerpt,
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
