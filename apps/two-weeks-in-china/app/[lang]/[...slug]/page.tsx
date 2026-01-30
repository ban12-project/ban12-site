import { Skeleton } from '@repo/ui/components/skeleton';
import { cacheLife } from 'next/cache';
import { notFound } from 'next/navigation';
import { MDXRemote, type MDXRemoteOptions } from 'next-mdx-remote-client/rsc';
import { Suspense } from 'react';
import remarkGfm from 'remark-gfm';
import { getAllPages, getPageByPath } from '#/lib/db/queries';
import { useMDXComponents } from '#/mdx-components';

function ErrorComponent({ error }: { error: Error | string }) {
  return (
    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900">
      <strong>Error rendering content:</strong>
      <p>{typeof error === 'string' ? error : error.message}</p>
    </div>
  );
}

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
  const pages = await getAllPages();

  return pages.map((page) => {
    // path is like "/en/plan-trip/visa-policy"
    // We need to split into lang and slug parts
    const parts = page.path.split('/').filter(Boolean);
    const lang = parts[0];
    const slug = parts.slice(1);

    return { lang, slug };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
  const path = `/${lang}/${slug.join('/')}`;
  const page = await getPageByPath(path);

  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: `${page.title} | Two Weeks in China`,
    description: page.subtitle,
  };
}

// Hoisted static options object to avoid re-creation on every render
const mdxOptions: MDXRemoteOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
  },
};

// Cached MDX renderer for ISR behavior
async function CachedMDX({ content }: { content: string }) {
  'use cache';
  cacheLife('hours');

  const components = useMDXComponents({});

  return (
    <MDXRemote
      source={content}
      options={mdxOptions}
      components={components}
      onError={ErrorComponent}
    />
  );
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string[] }>;
}) {
  const { lang, slug } = await params;
  const path = `/${lang}/${slug.join('/')}`;
  const page = await getPageByPath(path);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-dark mb-2">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="text-xl text-dark/60 font-medium">{page.subtitle}</p>
        )}
      </div>

      {/* MDX Content */}
      <div className="prose prose-lg max-w-none">
        <Suspense fallback={<LoadingComponent />}>
          <CachedMDX content={page.content} />
        </Suspense>
      </div>
    </div>
  );
}
