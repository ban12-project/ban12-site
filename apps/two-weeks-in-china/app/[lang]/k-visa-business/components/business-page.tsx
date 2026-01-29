import { cn } from '@repo/ui/lib/utils';
import { Briefcase, Check, Globe } from 'lucide-react';

interface BusinessSectionItem {
  title?: string;
  content: string;
  sub_items?: string[];
}

interface BusinessSection {
  title: string;
  description?: string;
  content?: string;
  items?: BusinessSectionItem[];
}

interface BusinessContent {
  title: string;
  subtitle: string;
  description?: string;
  sections: BusinessSection[];
}

interface BusinessPageProps {
  content: BusinessContent;
  lang: string;
  slug: string;
}

export function BusinessPage({ content }: BusinessPageProps) {
  return (
    <div className="min-h-screen bg-(--color-grey) pb-20">
      {/* Hero Section */}
      <div className="bg-(--color-dark) text-white pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl hidden md:block">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans tracking-tight">
                {content.title}
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                {content.subtitle}
              </p>
            </div>
          </div>
          {content.description && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mt-8">
              <p className="text-gray-300 leading-relaxed">
                {content.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-8 space-y-8">
        {content.sections.map((section, idx) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl shadow-sm p-8 border border-(--color-grey)"
          >
            <h2 className="text-2xl font-bold text-(--color-dark) mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-(--color-dark) text-primary text-sm font-bold">
                {idx + 1}
              </span>
              {section.title}
            </h2>

            {section.description && (
              <p className="text-gray-600 mb-6 italic">{section.description}</p>
            )}

            {section.content && (
              <p className="text-(--color-dark) mb-6 leading-relaxed">
                {section.content}
              </p>
            )}

            {section.items && (
              <div className="grid gap-4">
                {section.items.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className={cn(
                      'p-5 rounded-xl border transition-colors',
                      item.title
                        ? 'bg-gray-50 border-gray-100 hover:border-primary/30'
                        : 'bg-white border-transparent pl-0 py-2',
                    )}
                  >
                    {item.title ? (
                      <>
                        <h3 className="font-bold text-(--color-dark) mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed pl-3.5 border-l-2 border-gray-200">
                          {item.content}
                        </p>
                      </>
                    ) : (
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-(--color-dark) leading-relaxed">
                          {item.content}
                        </span>
                      </div>
                    )}

                    {item.sub_items && (
                      <ul className="mt-3 pl-8 space-y-2">
                        {item.sub_items.map((sub) => (
                          <li
                            key={sub}
                            className="text-sm text-gray-500 list-disc"
                          >
                            {sub}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Call to Action based on slug */}
        <div className="bg-(--color-dark) rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Apply?
          </h3>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Make sure to check the official COVA website or your local consulate
            for the most up-to-date requirements.
          </p>
          <a
            href="https://consular.mfa.gov.cn/VISA/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-(--color-dark) font-bold rounded-full hover:bg-white transition-colors"
          >
            Visit Official COVA System
            <Globe className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
