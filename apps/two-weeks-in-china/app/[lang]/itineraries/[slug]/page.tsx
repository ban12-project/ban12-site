import { notFound } from 'next/navigation';
import { GuidePage } from '../components/guide-page';
import { ItineraryListPage } from '../components/itinerary-list-page';
import { ItineraryPage } from '../components/itinerary-page';
import guidesData from '../data/guides.json';
import itinerariesData from '../data/itineraries.json';

const CATEGORIES = {
  'routes-240h': {
    title: '10 Days (240 Hours) in China',
    subtitle: 'The Golden Routes for maximum exploration without a visa.',
    items: ['classic-triangle', 'gba-innovation'],
  },
  'routes-72h': {
    title: '72-Hour Layover Essentials',
    subtitle: 'Perfect detailed guides for your short stopover in major hubs.',
    items: ['beijing-stopover', 'shanghai-stopover'],
  },
  'family-trips': {
    title: 'Family Friendly Adventures',
    subtitle: 'Safe, fun, and educational trips tailored for parents and kids.',
    items: ['chengdu-family', 'shanghai-family'],
  },
  'train-tours': {
    title: 'High-Speed Train Tours',
    subtitle: 'Experience China Speed. Inter-city travel made easy.',
    items: ['yangtze-delta-loop', 'hk-cross-border'],
  },
};

export async function generateStaticParams() {
  const itinerarySlugs = Object.keys(itinerariesData).map((slug) => ({
    slug: slug,
  }));

  const categorySlugs = Object.keys(CATEGORIES).map((slug) => ({
    slug: slug,
  }));

  const guideSlugs = Object.keys(guidesData).map((slug) => ({
    slug: slug,
  }));

  return [...itinerarySlugs, ...categorySlugs, ...guideSlugs];
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = lang as 'en' | 'zh';

  // Check if it's a guide
  const guideData = guidesData[slug as keyof typeof guidesData];
  if (guideData) {
    const content = guideData[locale] || guideData.en;
    if (!content) notFound();
    return <GuidePage content={content} lang={lang} />;
  }

  // Check if it's a category
  const category = CATEGORIES[slug as keyof typeof CATEGORIES];
  if (category) {
    const items = category.items
      .map((itemSlug: string) => {
        const data = itinerariesData[itemSlug as keyof typeof itinerariesData];
        const content = data?.[locale as keyof typeof data] || data?.en;
        if (!content) return null;
        return {
          slug: itemSlug,
          ...content,
        };
      })
      .filter(Boolean);

    return (
      <ItineraryListPage
        title={category.title}
        subtitle={category.subtitle}
        // biome-ignore lint/suspicious/noExplicitAny: Content structure is dynamic and validated at runtime/component level
        itineraries={items as any}
        lang={lang}
      />
    );
  }

  // Check if it's a specific itinerary
  const data = itinerariesData[slug as keyof typeof itinerariesData];

  if (!data) {
    notFound();
  }

  const content = data[locale as keyof typeof data] || data.en;

  if (!content) {
    notFound();
  }

  return <ItineraryPage content={content} lang={lang} />;
}
