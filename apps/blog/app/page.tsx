import Post from '#/components/post'

import { getAllPosts } from '../lib/api'

export default async function Index() {
  const allPosts = await getAllPosts()

  return <Post posts={allPosts} />
}
