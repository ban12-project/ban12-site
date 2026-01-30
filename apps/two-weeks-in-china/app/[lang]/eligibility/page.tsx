import { Skeleton } from '@repo/ui/components/skeleton';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAllCountries } from '#/lib/db/queries';
import { getDictionary, type Locale, type Messages } from '#/lib/i18n';
import { EligibilityForm } from '../components/eligibility-form';
import { PolicyExplanation } from './components/policy-explanation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.eligibility.title,
    description: dict.eligibility.description,
  };
}

// Loading skeleton for the eligibility form
function EligibilityFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 rounded-xl w-full" />
      <Skeleton className="h-14 rounded-xl w-48" />
    </div>
  );
}

// Async component for form content that fetches countries
async function EligibilityFormContent({ dict }: { dict: Messages }) {
  const countries = await getAllCountries();

  return <EligibilityForm dict={dict} countries={countries} />;
}

// Loading skeleton for policy explanation
function PolicyExplanationSkeleton() {
  return (
    <div className="space-y-16">
      <Skeleton className="rounded-[30px] h-96" />
      <div className="space-y-8">
        <Skeleton className="h-10 rounded w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
              key={`skeleton-${i}`}
              className="h-12 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function EligibilityPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-20">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          {dict.eligibility.heading}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          {dict.eligibility.description}
        </p>
      </div>

      <Suspense fallback={<EligibilityFormSkeleton />}>
        <EligibilityFormContent dict={dict} />
      </Suspense>

      <Suspense fallback={<PolicyExplanationSkeleton />}>
        <PolicyExplanation dict={dict} />
      </Suspense>
    </div>
  );
}
