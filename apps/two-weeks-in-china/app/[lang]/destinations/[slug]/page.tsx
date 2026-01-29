import { notFound } from 'next/navigation';
import destinationsData from '#/data/destinations.json';
import { getDictionary, type Locale } from '#/lib/i18n';
import { DestinationPage } from '../components/destination-page';

// Define the shape of our data to avoid TS errors
type DestinationData = {
  slug: string;
  en: DestinationContent;
  zh: DestinationContent;
};

interface DestinationContent {
  title: string;
  subtitle: string;
  description: string;
  allowed_cities: string;
  entry_ports: string[];
  rules: string[];
  itinerary_highlight: string;
}

export async function generateStaticParams() {
  return destinationsData.map((dest) => ({
    slug: dest.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang as Locale);

  const destination = destinationsData.find((d) => d.slug === slug) as
    | DestinationData
    | undefined;

  if (!destination) {
    notFound();
  }

  const locale = lang as 'en' | 'zh';
  const content = destination[locale];

  if (!content) {
    notFound();
  }

  return (
    <DestinationPage
      content={content}
      common={dict.destinations_content.common}
      lang={lang}
    />
  );
}
