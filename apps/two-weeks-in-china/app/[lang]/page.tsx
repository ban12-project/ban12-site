import { Skeleton } from '@repo/ui/components/skeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getDictionary, type Locale } from '#/lib/i18n';
import { HeroSection } from './components/hero-section';
import { ItinerarySection } from './components/itinerary-section';
import { KVisaSection } from './components/k-visa-section';
import { PolicySection } from './components/policy-section';
import { RulesSection } from './components/rules-section';
import { SurvivalSection } from './components/survival-section';

// Loading fallback for PolicySection
function PolicySectionSkeleton() {
  return (
    <section className="grid gap-10 scroll-mt-24">
      <div className="flex items-center gap-4">
        <Skeleton className="p-2 rounded-[7px] h-12 w-64" />
      </div>
      <Skeleton className="h-48 rounded-[30px]" />
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="h-80 rounded-[30px]" />
        <Skeleton className="h-80 rounded-[30px] bg-slate-700" />
      </div>
    </section>
  );
}

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
      <Suspense fallback={<PolicySectionSkeleton />}>
        <PolicySection dict={dict} />
      </Suspense>
      <SurvivalSection dict={dict} />
      <ItinerarySection dict={dict} />
      <RulesSection dict={dict} />
      <KVisaSection dict={dict} />
    </div>
  );
}
