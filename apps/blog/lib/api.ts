import fs from 'fs'
import { join } from 'path'
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

const postsDirectory = join(process.cwd(), '_posts')

function getPostSlugsInDev() {
  return fs.readdirSync(postsDirectory)
}

function getPostBySlugInDev(slug: string) {
  const realSlug = slug.replace(/\.md$/, '')
  const fullPath = join(postsDirectory, `${realSlug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)

  return { ...data, slug: realSlug, content } as Post
}

function getAllPostsInDev() {
  const slugs = getPostSlugsInDev()
  const posts = slugs
    .map((slug) => getPostBySlugInDev(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1))
  return posts
}

async function _getPostSlugs() {
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

async function _getPostBySlug(slug: string, download_url?: string) {
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

async function _getAllPosts() {
  const slugs = await _getPostSlugs()
  const posts = await Promise.all(
    slugs.map((slug) => _getPostBySlug(slug.name, slug.download_url)),
  )
    // sort posts by date in descending order
    .then((posts) =>
      posts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1)),
    )
  return posts
}

const isDev = process.env.NODE_ENV === 'development'

export const getPostSlugs = isDev ? getPostSlugsInDev : _getPostSlugs
export const getPostBySlug = isDev ? getPostBySlugInDev : _getPostBySlug
export const getAllPosts = isDev ? getAllPostsInDev : _getAllPosts
