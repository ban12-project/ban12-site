import { Skeleton } from '@repo/ui/components/skeleton';
import { cacheLife } from 'next/cache';
import { notFound } from 'next/navigation';
import { MDXRemote, type MDXRemoteOptions } from 'next-mdx-remote-client/rsc';
import { Suspense } from 'react';
import remarkGfm from 'remark-gfm';
import { getAllPages, getPageByPath } from '#/lib/content/queries';
import type { ContentFormat } from '#/lib/content/types';
import { useMDXComponents } from '#/mdx-components';

function LoadingComponent() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 rounded w-3/4" />
      <Skeleton className="h-4 rounded w-1/2" />
      <Skeleton className="h-4 rounded w-5/6" />
    </div>
  );
}

export async function generateStaticParams() {
  return (await getAllPages()).map((page) => {
    const [lang, ...slug] = page.path.slice(1).split('/');
    return { lang, slug };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
  const page = await getPageByPath(`/${lang}/${slug.join('/')}`);
  if (!page) return { title: 'Not Found' };
  return {
    title: `${page.title} | Two Weeks in China`,
    description: page.subtitle,
  };
}

const mdxOptions: Record<ContentFormat, MDXRemoteOptions> = {
  md: { mdxOptions: { format: 'md', remarkPlugins: [remarkGfm] } },
  mdx: { mdxOptions: { format: 'mdx', remarkPlugins: [remarkGfm] } },
};

async function CachedMDX({
  content,
  format,
}: {
  content: string;
  format: ContentFormat;
}) {
  'use cache';
  cacheLife('hours');
  // A .md file is deliberately not evaluated as executable MDX. Legacy .mdx
  // remains trusted repository code and retains the existing custom components.
  return (
    <MDXRemote
      source={content}
      options={mdxOptions[format]}
      components={useMDXComponents({})}
    />
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
  const page = await getPageByPath(`/${lang}/${slug.join('/')}`);
  if (!page) notFound();
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-dark mb-2">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="text-xl text-dark/60 font-medium">{page.subtitle}</p>
        )}
      </div>
      <div className="prose prose-lg max-w-none">
        <Suspense fallback={<LoadingComponent />}>
          <CachedMDX content={page.content} format={page.format} />
        </Suspense>
      </div>
    </div>
  );
}
