import type { Metadata } from 'next';
import { getDictionary, type Locale } from '#/lib/i18n';
import { EligibilityForm } from './components/eligibility-form';
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

      <EligibilityForm dict={dict} />

      <PolicyExplanation dict={dict} />
    </div>
  );
}
