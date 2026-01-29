'use client';

import { cn } from '@repo/ui/lib/utils';
import { AlertTriangle, Check, Smartphone, Train, X } from 'lucide-react';

interface SurvivalContent {
  title: string;
  subtitle: string;
  pain_point: {
    title: string;
    content: string;
  };
  // Variation 1: Solutions (eSIM/VPN)
  solutions?: {
    type: string;
    title: string;
    description?: string;
    pros?: string[];
    cons?: string[];
    providers?: string[];
    advice?: string;
  }[];
  warning?: {
    title: string;
    content: string;
  };
  // Variation 2: Steps (Payment)
  steps?: {
    title: string;
    content: string;
  }[];
  fees?: {
    title: string;
    items: string[];
  };
  // Variation 3: Platforms (Trains)
  platforms?: {
    name: string;
    badge?: string;
    pros: string[];
    cons: string[];
  }[];
  boarding_tip?: {
    title: string;
    content: string;
  };
  // Variation 4: Apps
  categories?: {
    name: string;
    apps: {
      name: string;
      desc: string;
    }[];
  }[];
  advice?: {
    title: string;
    content: string;
  };
  tips?: string[];
}

interface SurvivalPageProps {
  content: SurvivalContent;
  lang: string;
}

export function SurvivalPage({ content }: SurvivalPageProps) {
  return (
    <div className="min-h-screen bg-(--color-grey) pb-20">
      {/* Hero Section */}
      <div className="bg-(--color-dark) text-white pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans tracking-tight">
            {content.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">{content.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-8 space-y-8">
        {/* Pain Point / Context */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-(--color-grey)">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-(--color-dark) text-primary rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-(--color-dark) mb-2">
                {content.pain_point.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {content.pain_point.content}
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Content: Solutions (eSIM vs VPN) */}
        {content.solutions && (
          <div className="grid md:grid-cols-2 gap-6">
            {content.solutions.map((solution) => (
              <div
                key={solution.title}
                className={cn(
                  'rounded-2xl p-6 border-2',
                  solution.type === 'recommended'
                    ? 'bg-white border-primary shadow-md relative overflow-hidden'
                    : 'bg-white border-(--color-grey)',
                )}
              >
                {solution.type === 'recommended' && (
                  <div className="absolute top-0 right-0 bg-primary text-(--color-dark) text-xs font-bold px-3 py-1 rounded-bl-xl">
                    RECOMMENDED
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2 text-(--color-dark)">
                  {solution.title}
                </h3>
                {solution.description && (
                  <p className="text-sm text-gray-500 mb-4">
                    {solution.description}
                  </p>
                )}

                {solution.pros && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-(--color-dark) mb-2">
                      Pros:
                    </p>
                    <ul className="space-y-2">
                      {solution.pros.map((pro) => (
                        <li
                          key={pro}
                          className="flex items-start gap-2 text-sm text-(--color-dark)"
                        >
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {solution.cons && (
                  <div className="mb-4">
                    <p className="text-sm font-bold text-(--color-dark) opacity-70 mb-2">
                      Cons:
                    </p>
                    <ul className="space-y-2">
                      {solution.cons.map((con) => (
                        <li
                          key={con}
                          className="flex items-start gap-2 text-sm text-(--color-dark)/70"
                        >
                          <X className="w-4 h-4 text-(--color-dark) mt-0.5 shrink-0" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {solution.advice && (
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                    <p className="text-sm italic text-gray-600">
                      💡 {solution.advice}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Content: Steps (Payment) */}
        {content.steps && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-(--color-grey)">
            <h3 className="text-2xl font-bold text-(--color-dark) mb-6">
              Setup Guide
            </h3>
            <div className="space-y-8">
              {content.steps.map((step, idx) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-(--color-dark) text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    {idx !== content.steps!.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-100 my-2" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h4 className="text-lg font-bold text-(--color-dark) mb-1">
                      {step.title}
                    </h4>
                    <p className="text-gray-600">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Content: Platforms (Train) */}
        {content.platforms && (
          <div className="grid md:grid-cols-2 gap-6">
            {content.platforms.map((platform) => (
              <div
                key={platform.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-(--color-grey)"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-(--color-dark)">
                    {platform.name}
                  </h3>
                  {platform.badge && (
                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded text-gray-600">
                      {platform.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase text-(--color-dark)/50 font-bold mb-2">
                      Good
                    </p>
                    <ul className="space-y-2">
                      {platform.pros.map((pro) => (
                        <li
                          key={pro}
                          className="flex items-start gap-2 text-sm text-(--color-dark)"
                        >
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-(--color-dark)/50 font-bold mb-2">
                      Bad
                    </p>
                    <ul className="space-y-2">
                      {platform.cons.map((con) => (
                        <li
                          key={con}
                          className="flex items-start gap-2 text-sm text-(--color-dark)/70"
                        >
                          <X className="w-4 h-4 text-(--color-dark) mt-0.5 shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Content: Apps Categories */}
        {content.categories && (
          <div className="grid gap-6">
            {content.categories.map((cat) => (
              <div
                key={cat.name}
                className="bg-white rounded-2xl p-6 shadow-sm border border-(--color-grey)"
              >
                <h3 className="text-lg font-bold text-(--color-dark) mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  {cat.name}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {cat.apps.map((app) => (
                    <div key={app.name} className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-bold text-(--color-dark) mb-1">
                        {app.name}
                      </h4>
                      <p className="text-sm text-gray-500">{app.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Misc Sections */}
        {content.warning && (
          <div className="bg-white rounded-2xl p-6 border border-(--color-dark) flex gap-4">
            <AlertTriangle className="w-6 h-6 text-(--color-dark) shrink-0" />
            <div>
              <h3 className="font-bold text-(--color-dark) mb-1">
                {content.warning.title}
              </h3>
              <p className="text-(--color-dark)/80 text-sm">
                {content.warning.content}
              </p>
            </div>
          </div>
        )}

        {content.fees && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-(--color-grey)">
            <h3 className="font-bold text-(--color-dark) mb-4">
              {content.fees.title}
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              {content.fees.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {content.boarding_tip && (
          <div className="bg-(--color-dark) text-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Train className="w-5 h-5" />
              {content.boarding_tip.title}
            </h3>
            <p className="text-gray-300">{content.boarding_tip.content}</p>
          </div>
        )}

        {content.advice && (
          <div className="bg-primary/20 rounded-2xl p-6 border border-primary/30">
            <h3 className="font-bold text-(--color-dark) mb-2">
              💡 {content.advice.title}
            </h3>
            <p className="text-(--color-dark)/80">{content.advice.content}</p>
          </div>
        )}

        {content.tips && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-(--color-grey)">
            <h3 className="font-bold text-(--color-dark) mb-4">Pro Tips</h3>
            <ul className="space-y-3">
              {content.tips.map((tip) => (
                <li key={tip} className="flex gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
