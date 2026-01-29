import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import content from '../../../../data/k-visa-business.json';
import { BusinessPage } from '../components/business-page';

// Force static generation
export const dynamic = 'force-static';

// --- Types ---
interface SectionItem {
  title?: string;
  content: string;
  sub_items?: string[];
}

interface Section {
  title: string;
  description?: string;
  content?: string;
  items?: SectionItem[];
}

interface LocalizedContent {
  title: string;
  subtitle: string;
  description?: string;
  sections: Section[];
}

interface BusinessItem {
  slug: string;
  en: LocalizedContent;
  zh: LocalizedContent;
}

// Cast content to typed array
const typedContent = content as BusinessItem[];

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  const languages = ['en', 'zh'] as const;

  typedContent.forEach((item) => {
    languages.forEach((lang) => {
      params.push({ slug: item.slug, lang });
    });
  });

  return params;
}

type Props = {
  params: Promise<{ slug: string; lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lang } = await params;
  const item = typedContent.find((c) => c.slug === slug);

  if (!item) {
    return {};
  }

  // Type guard to ensure lang is valid key
  const validLang = (lang === 'zh' ? 'zh' : 'en') as keyof typeof item;
  // We already checked item exists, but TypeScript needs to know we're accessing 'en' or 'zh'
  // excluding 'slug' from the access
  if (validLang !== 'en' && validLang !== 'zh') return {};

  const localizedCtx = item[validLang] as LocalizedContent;

  if (!localizedCtx) {
    return {};
  }

  return {
    title: `${localizedCtx.title} - Two Weeks in China`,
    description: localizedCtx.description || localizedCtx.subtitle,
  };
}

export default async function Page({ params }: Props) {
  const { slug, lang } = await params;
  const item = typedContent.find((c) => c.slug === slug);

  if (!item) {
    notFound();
  }

  const validLang = (lang === 'zh' ? 'zh' : 'en') as 'en' | 'zh';
  const localizedContent = item[validLang];

  if (!localizedContent) {
    notFound();
  }

  return <BusinessPage content={localizedContent} lang={lang} slug={slug} />;
}
