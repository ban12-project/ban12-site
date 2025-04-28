import matter from 'gray-matter'

export type Author = {
  name: string
  picture: string
}

export type Post = {
  slug: string
  title: string
  date: string
  coverImage: string
  author: Author
  excerpt: string
  ogImage: {
    url: string
  }
  content: string
  preview?: boolean
}

interface GithubContentFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  download_url: string
}

export async function getPostSlugs() {
  const response = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${process.env.GITHUB_REPO_POSTS_PATH}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      },
      next: {
        tags: ['posts'],
      },
    },
  )

  const data = (await response.json()) as GithubContentFile[]
  return data
}

export async function getPostBySlug(slug: string, download_url?: string) {
  const realSlug = slug.replace(/\.md$/, '')
  download_url ||= `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/${process.env.GITHUB_REPO_POSTS_PATH}/${slug}.md`
  const response = await fetch(download_url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
    },
  })
  const fileContents = await response.text()
  const { data, content } = matter(fileContents)

  return { ...data, slug: realSlug, content } as Post
}

export async function getAllPosts() {
  const slugs = await getPostSlugs()
  const posts = await Promise.all(
    slugs.map((slug) => getPostBySlug(slug.name, slug.download_url)),
  )
    // sort posts by date in descending order
    .then((posts) =>
      posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1)),
    )
  return posts
}
