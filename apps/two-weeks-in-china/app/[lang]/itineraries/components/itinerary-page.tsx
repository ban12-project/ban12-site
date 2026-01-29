'use client';

import { Calendar, Clock, Info, MapPin, Tag, Train } from 'lucide-react';

interface DayPlan {
  day: string;
  city: string;
  title: string;
  highlights: string[];
  activity: string;
  note: string;
}

interface ItineraryContent {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  duration: string;
  tags: string[];
  days: DayPlan[];
  tips: string[];
}

interface ItineraryPageProps {
  content: ItineraryContent;
  lang: string;
}

export function ItineraryPage({ content }: ItineraryPageProps) {
  return (
    <div className="min-h-screen bg-(--color-grey) pb-20">
      {/* Hero Section */}
      <div className="bg-(--color-dark) text-white pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-(--color-dark) text-xs font-bold uppercase tracking-wider">
              {content.category}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-white/20 text-white text-xs font-medium">
              <Clock className="w-3 h-3 mr-1.5" />
              {content.duration}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-sans tracking-tight leading-tight">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light leading-relaxed">
            {content.subtitle}
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm text-gray-300"
              >
                <Tag className="w-3 h-3 mr-1.5 text-primary" />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-10 relative z-20">
        <div className="grid gap-8">
          {/* Overview Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-(--color-grey)">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
              Overview
            </h2>
            <p className="text-lg md:text-xl text-(--color-dark) leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Timeline Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-2 px-2">
              <div className="p-2 bg-(--color-dark) rounded-lg text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-(--color-dark)">
                Daily Itinerary
              </h2>
            </div>

            <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 space-y-12 pl-8 md:pl-12 py-2">
              {content.days.map((day) => (
                <div key={day.title} className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-10.25 md:-left-14.25 top-6 w-5 h-5 rounded-full border-4 border-white bg-(--color-dark) shadow-sm" />

                  <div className="bg-white rounded-2xl shadow-sm border border-(--color-grey) overflow-hidden group hover:shadow-md transition-shadow duration-300">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-baseline gap-3">
                        <span className="text-primary font-bold text-lg">
                          {day.day}
                        </span>
                        <span className="text-gray-400 font-medium">|</span>
                        <span className="text-(--color-dark) font-bold uppercase tracking-wide flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {day.city}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <h3 className="text-2xl font-bold text-(--color-dark) mb-4">
                        {day.title}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                            Highlights
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {day.highlights.map((h, i) => (
                              <span
                                // biome-ignore lint/suspicious/noArrayIndexKey: ignore
                                key={i}
                                className="px-3 py-1 bg-[#191a23]/5 text-(--color-dark) rounded-md text-sm font-medium border border-transparent hover:border-primary/50 transition-colors"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                            Experience
                          </h4>
                          <p className="text-gray-700 italic border-l-2 border-primary pl-4">
                            "{day.activity}"
                          </p>
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-4 flex gap-3 text-sm text-blue-900 mt-4">
                          <Info className="w-5 h-5 shrink-0 text-blue-600" />
                          <p>{day.note}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-(--color-dark) rounded-2xl shadow-lg p-8 md:p-10 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-24 -right-24 w-64 h-64 border-[20px] border-white/5 rounded-full" />
            <div className="absolute top-1/2 left-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="p-2 bg-white/10 rounded-lg">
                  <Train className="w-5 h-5 text-primary" />
                </span>
                Pro Tips for this Route
              </h2>
              <ul className="space-y-4">
                {content.tips.map((tip, idx) => (
                  <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: ignore
                    key={idx}
                    className="flex gap-4 items-start bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-(--color-dark) text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-gray-300 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
