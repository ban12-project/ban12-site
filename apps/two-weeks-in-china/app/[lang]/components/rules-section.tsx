import { AlertTriangle, Plane } from 'lucide-react';
import type { Messages } from '#/lib/i18n';

export function RulesSection({ dict }: { dict: Messages }) {
  return (
    <section id="rules" className="grid gap-10 scroll-mt-24">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-2 rounded-[7px]">
          <h2 className="text-3xl font-medium text-dark">
            {dict.sections.rules.num} {dict.sections.rules.title}
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Visual Rule */}
        <div className="lg:col-span-7 bg-grey rounded-[30px] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <AlertTriangle className="w-64 h-64 text-dark" />
          </div>
          <h3 className="text-2xl font-medium text-dark mb-8 relative z-10">
            {dict.sections.rules.abc_title}
          </h3>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
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
            <div className="h-0.5 bg-dark flex-1 w-full md:w-auto relative">
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
            <div className="h-0.5 bg-dark flex-1 w-full md:w-auto relative">
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

          <div className="mt-10 bg-dark text-white p-6 rounded-[14px] flex gap-4 items-start relative z-10">
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
        </div>

        {/* Country List */}
        <div className="lg:col-span-5 bg-white border border-dark rounded-[30px] p-8 shadow-[8px_8px_0px_0px_#191A23]">
          <h3 className="text-2xl font-medium text-dark mb-6">
            {dict.sections.rules.countries_title}
          </h3>
          <div className="space-y-6 h-100 overflow-y-auto pr-4 scrollbar-thin">
            <div>
              <span className="bg-grey px-2 py-1 rounded text-sm font-bold mb-2 inline-block">
                {dict.sections.rules.countries_schengen}
              </span>
              <p className="text-dark/80 leading-relaxed">
                {dict.sections.rules.countries_schengen_list}
              </p>
            </div>
            <div>
              <span className="bg-grey px-2 py-1 rounded text-sm font-bold mb-2 inline-block">
                {dict.sections.rules.countries_americas}
              </span>
              <p className="text-dark/80 leading-relaxed">
                {dict.sections.rules.countries_americas_list}
              </p>
            </div>
            <div>
              <span className="bg-grey px-2 py-1 rounded text-sm font-bold mb-2 inline-block">
                {dict.sections.rules.countries_asia}
              </span>
              <p className="text-dark/80 leading-relaxed">
                {dict.sections.rules.countries_asia_list}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
