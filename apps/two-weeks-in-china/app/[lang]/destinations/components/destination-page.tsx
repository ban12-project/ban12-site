'use client';

import { Info, Map as MapIcon, Plane } from 'lucide-react';

interface DestinationContent {
  title: string;
  subtitle: string;
  description: string;
  allowed_cities: string;
  entry_ports: string[];
  rules: string[];
  itinerary_highlight: string;
}

interface CommonContent {
  policy_badge: string;
  entry_ports_title: string;
  allowed_area_title: string;
  rules_title: string;
  itinerary_title: string;
}

interface DestinationPageProps {
  content: DestinationContent;
  common: CommonContent;
  lang: string;
}

export function DestinationPage({ content, common }: DestinationPageProps) {
  return (
    <div className="min-h-screen bg-(--color-grey) pb-20">
      {/* Hero Section */}
      <div className="bg-(--color-dark) text-white pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-block px-3 py-1 rounded-full bg-primary text-(--color-dark) text-sm font-bold mb-6">
            {common.policy_badge}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans tracking-tight">
            {content.title}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">{content.subtitle}</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-8">
        <div className="grid gap-8">
          {/* Main Description Card */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-(--color-grey)">
            <p className="text-lg text-(--color-dark) leading-relaxed">
              {content.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Permitted Area */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-(--color-grey)">
              <div className="flex items-center gap-3 mb-4 text-(--color-dark)">
                <div className="p-2 bg-(--color-grey) rounded-lg text-(--color-dark)">
                  <MapIcon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">
                  {common.allowed_area_title}
                </h2>
              </div>
              <div className="bg-(--color-grey) rounded-xl p-4 border border-(--color-grey)">
                <p className="text-(--color-dark) font-medium">
                  {content.allowed_cities}
                </p>
              </div>
            </div>

            {/* Entry Ports */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-(--color-grey)">
              <div className="flex items-center gap-3 mb-4 text-(--color-dark)">
                <div className="p-2 bg-(--color-grey) rounded-lg text-(--color-dark)">
                  <Plane className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold">
                  {common.entry_ports_title}
                </h2>
              </div>
              <ul className="space-y-3">
                {content.entry_ports.map((port) => (
                  <li
                    key={port}
                    className="flex items-start gap-2 text-(--color-dark) text-sm"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{port}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Rules Section */}
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-(--color-grey)">
            <div className="flex items-center gap-3 mb-6 text-(--color-dark)">
              <div className="p-2 bg-(--color-grey) rounded-lg text-(--color-dark)">
                <Info className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">{common.rules_title}</h2>
            </div>
            <div className="space-y-4">
              {content.rules.map((rule, idx) => (
                <div
                  key={rule}
                  className="flex gap-4 p-4 rounded-xl bg-(--color-grey) border border-(--color-grey)"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-(--color-dark) text-white text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-(--color-dark)">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary Highlight */}
          <div className="bg-(--color-dark) rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <h3 className="font-medium text-gray-400 mb-2 uppercase tracking-wide text-xs">
              {common.itinerary_title}
            </h3>
            <p className="text-2xl md:text-3xl font-bold leading-tight">
              {content.itinerary_highlight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
