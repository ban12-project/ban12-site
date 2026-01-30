import { Button } from '@repo/ui/components/button';
import type { Messages } from '#/lib/i18n';

export function HeroSection({ dict }: { dict: Messages }) {
  return (
    <header className="flex flex-col items-start gap-8 py-10 md:py-20">
      <div className="bg-primary px-3 py-1 rounded-md inline-block">
        <span className="text-xl font-medium text-dark">
          {dict.common.latest_policy}
        </span>
      </div>

      <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-dark leading-[1.1]">
        {dict.hero.title_line1}
        <br />
        <span className="bg-primary px-2 leading-normal box-decoration-clone">
          {dict.hero.title_line2}
        </span>
      </h1>

      <p className="text-xl md:text-2xl text-dark max-w-2xl font-normal leading-relaxed">
        {dict.hero.subtitle}
      </p>

      <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
        <Button className="bg-dark text-white hover:bg-dark/90 rounded-[14px] px-8 py-7 h-auto text-xl font-normal w-full sm:w-auto transition-transform hover:scale-105">
          {dict.common.cta_plan}
        </Button>
        <Button
          variant="outline"
          className="bg-transparent border border-dark text-dark hover:bg-dark hover:text-white rounded-[14px] px-8 py-7 h-auto text-xl font-normal w-full sm:w-auto transition-all"
        >
          {dict.common.cta_check}
        </Button>
      </div>
    </header>
  );
}
