import type { Metadata } from 'next';

import PostList from '#/components/blog/post-list';
import { getAllPosts } from '#/lib/blog/api';
import { i18n } from '#/lib/i18n';

export default async function BlogPage() {
  const posts = await getAllPosts();

  return <PostList posts={posts} />;
}

export async function generateMetadata({
  params,
}: PageProps<'/[lang]/blog'>): Promise<Metadata> {
  const { lang } = await params;
  const path = '/blog';

  return {
    alternates: {
      canonical: lang === i18n.defaultLocale ? path : `/${lang}${path}`,
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((locale) => [
          locale,
          locale === i18n.defaultLocale ? path : `/${locale}${path}`,
        ]),
      ),
    },
  };
}
