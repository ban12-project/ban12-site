import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import survivalData from '#/data/digital-survival.json';
import { SurvivalPage } from '../components/survival-page';

// Define params type for Next.js 15+
type Params = Promise<{ lang: string; slug: string }>;

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  const languages = ['en', 'zh'];

  for (const item of survivalData) {
    for (const lang of languages) {
      params.push({ lang, slug: item.slug });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = survivalData.find((d) => d.slug === slug);

  if (!item) {
    return {
      title: 'Not Found',
    };
  }

  const content = item[lang === 'zh' ? 'zh' : 'en'];

  return {
    title: `${content.title} | Two Weeks in China`,
    description: content.subtitle,
  };
}

export default async function Page({ params }: { params: Params }) {
  const { lang, slug } = await params;
  const item = survivalData.find((d) => d.slug === slug);

  if (!item) {
    notFound();
  }

  const content = item[lang === 'zh' ? 'zh' : 'en'];

  return <SurvivalPage content={content} lang={lang} />;
}
