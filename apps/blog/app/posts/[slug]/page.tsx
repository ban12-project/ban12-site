import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import Container from '../../_components/container'
import Header from '../../_components/header'
import { PostBody } from '../../_components/post-body'
import { PostHeader } from '../../_components/post-header'
import { getAllPosts, getPostBySlug } from '../../../lib/api'
import { CMS_NAME } from '../../../lib/constants'
import markdownToHtml from '../../../lib/markdownToHtml'

export default async function Post(props: Params) {
  const params = await props.params
  const post = getPostBySlug(params.slug)

  if (!post) {
    return notFound()
  }

  const content = await markdownToHtml(post.content || '')

  return (
    <main>
      <Container>
        <Header />
        <article className="mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
          />
          <PostBody content={content} />
        </article>
      </Container>
    </main>
  )
}

type Params = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params
  const post = getPostBySlug(params.slug)

  if (!post) {
    return notFound()
  }

  const title = `${post.title} | Next.js Blog Example with ${CMS_NAME}`

  return {
    openGraph: {
      title,
      images: [post.ogImage.url],
    },
  }
}

export function generateStaticParams() {
  const posts = getAllPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
