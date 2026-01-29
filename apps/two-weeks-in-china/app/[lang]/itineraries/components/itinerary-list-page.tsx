'use client';

import { ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface ItinerarySummary {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  tags: string[];
}

interface ItineraryListPageProps {
  title: string;
  subtitle: string;
  itineraries: ItinerarySummary[];
  lang: string;
}

export function ItineraryListPage({
  title,
  subtitle,
  itineraries,
  lang,
}: ItineraryListPageProps) {
  return (
    <div className="min-h-screen bg-(--color-grey) pb-20">
      {/* Hero Section */}
      <div className="bg-(--color-dark) text-white pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
        <div className="grid gap-6">
          {itineraries.map((item) => (
            <Link
              key={item.slug}
              href={`/${lang}/itineraries/${item.slug}`}
              className="block group"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-(--color-grey) p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:border-primary/50 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-(--color-dark) text-xs font-bold uppercase tracking-wider">
                        <Clock className="w-3 h-3 mr-1" />
                        {item.duration}
                      </span>
                      <div className="flex gap-2">
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-(--color-dark) mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
                      {item.subtitle}
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-center md:justify-end">
                    <div className="w-12 h-12 rounded-full bg-(--color-grey) flex items-center justify-center text-(--color-dark) group-hover:bg-primary group-hover:text-(--color-dark) transition-colors">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
