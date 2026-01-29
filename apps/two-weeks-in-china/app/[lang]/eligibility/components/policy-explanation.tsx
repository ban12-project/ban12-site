import { AlertTriangle, Plane } from 'lucide-react';
import type { Messages } from '#/lib/i18n';
import { TRANSIT_240H_COUNTRIES } from './countries';

export function PolicyExplanation({ dict }: { dict: Messages }) {
  return (
    <div className="space-y-16">
      {/* 1. Visual A->B->C Rule */}
      <section className="bg-grey rounded-[30px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <AlertTriangle className="w-64 h-64 text-dark" />
        </div>
        <h3 className="text-2xl font-medium text-dark mb-8 relative z-10">
          {dict.sections.rules.abc_title}
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 max-w-4xl mx-auto">
          {/* A */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-white border-2 border-dark flex items-center justify-center text-3xl font-medium">
              A
            </div>
            <span className="font-medium text-lg">
              {dict.sections.rules.abc_a}
            </span>
          </div>

          {/* Arrow */}
          <div className="h-0.5 bg-dark flex-1 w-full md:w-auto relative min-w-[50px]">
            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-90 md:rotate-0 fill-dark" />
          </div>

          {/* B (China) */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-primary border-2 border-dark flex items-center justify-center text-4xl font-bold shadow-[4px_4px_0px_0px_#191A23]">
              B
            </div>
            <span className="font-medium text-lg bg-primary px-1">
              {dict.sections.rules.abc_b}
            </span>
          </div>

          {/* Arrow */}
          <div className="h-0.5 bg-dark flex-1 w-full md:w-auto relative min-w-[50px]">
            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rotate-90 md:rotate-0 fill-dark" />
          </div>

          {/* C */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-dark text-primary flex items-center justify-center text-3xl font-medium">
              C
            </div>
            <span className="font-medium text-lg">
              {dict.sections.rules.abc_c}
            </span>
          </div>
        </div>

        <div className="mt-10 bg-dark text-white p-6 rounded-[14px] flex gap-4 items-start relative z-10 max-w-2xl mx-auto">
          <AlertTriangle className="text-primary w-6 h-6 shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-lg text-primary mb-1">
              {dict.sections.rules.abc_alert_title}
            </h4>
            <p className="text-slate-300">
              {dict.sections.rules.abc_alert_desc}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Full Country List */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary p-2 rounded-[7px]">
            <h3 className="text-2xl font-medium text-dark">
              {dict.sections.rules.countries_title}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {TRANSIT_240H_COUNTRIES.sort().map((c) => (
            <div
              key={c}
              className="flex items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 shrink-0" />
              <span
                className="text-sm font-medium text-slate-700 truncate"
                title={c}
              >
                {c}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
