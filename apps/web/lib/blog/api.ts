import fs from 'node:fs';
import { basename, join } from 'node:path';
import matter from 'gray-matter';

export type Author = {
  name: string;
  picture: string;
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  coverImage?: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
};

const postsDirectory = join(process.cwd(), '_posts');
const posts = fs
  .readdirSync(postsDirectory)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const slug = file.replace(/\.md$/, '');
    const fileContents = fs.readFileSync(join(postsDirectory, file), 'utf8');
    const { data, content } = matter(fileContents);

    return { ...data, slug, content } as Post;
  })
  .toSorted((post1, post2) => (post1.date > post2.date ? -1 : 1));

export function getPostBySlug(slug: string): Post | null {
  const decodedSlug = decodeURIComponent(slug.replace(/\.md$/, ''));

  if (basename(decodedSlug) !== decodedSlug) return null;

  return posts.find((post) => post.slug === decodedSlug) ?? null;
}

export function getAllPosts(): readonly Post[] {
  return posts;
}
