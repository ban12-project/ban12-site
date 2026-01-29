import type { Metadata } from 'next';
import { getDictionary, type Locale } from '#/lib/i18n';
import { HeroSection } from './components/hero-section';
import { ItinerarySection } from './components/itinerary-section';
import { KVisaSection } from './components/k-visa-section';
import { PolicySection } from './components/policy-section';
import { RulesSection } from './components/rules-section';
import { SurvivalSection } from './components/survival-section';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.common.title,
    description: dict.common.description,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl space-y-24">
      <HeroSection dict={dict} />
      <PolicySection dict={dict} />
      <SurvivalSection dict={dict} />
      <ItinerarySection dict={dict} />
      <RulesSection dict={dict} />
      <KVisaSection dict={dict} />
    </div>
  );
}
