'use client';

import { Clock, FileText, Info, ShieldCheck } from 'lucide-react';

interface GuideSection {
  title: string;
  content: string; // The content is a string but might contain newlines we should handle
}

interface GuideContent {
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: GuideSection[];
}

interface GuidePageProps {
  content: GuideContent;
  lang: string;
}

export function GuidePage({ content }: GuidePageProps) {
  return (
    <div className="min-h-screen bg-(--color-grey) pb-20">
      {/* Hero Section - Matching ItineraryPage but with distinct icon/vibe */}
      <div className="bg-(--color-dark) text-white pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Accent - Using specific color for Guides */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />

        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider">
              Essential Guide
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 text-white text-xs font-medium">
              <Clock className="w-3 h-3 mr-1.5" />
              Updated: {content.updatedAt}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-6 font-sans tracking-tight leading-tight">
            {content.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
            {content.subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 -mt-10 relative z-20">
        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-(--color-grey)"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    {index === 0 ? (
                      <Info className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-(--color-dark) mb-3">
                    {section.title}
                  </h2>
                  <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer Card */}
          <div className="bg-[#191a23] rounded-2xl p-6 md:p-8 text-center border border-white/5">
            <h3 className="text-white font-bold text-lg mb-2 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Official Requirements
            </h3>
            <p className="text-gray-400 text-sm">
              Please strictly follow official guidelines. Regulations can
              change, so checks prior to departure are recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
