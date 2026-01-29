import { Badge } from '@repo/ui/components/badge';
import { Card, CardContent } from '@repo/ui/components/card';
import { MapPin } from 'lucide-react';
import type { Messages } from '#/lib/i18n';

export function ItinerarySection({ dict }: { dict: Messages }) {
  return (
    <section id="itinerary" className="grid gap-10 pb-20 scroll-mt-24">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-2 rounded-[7px]">
          <h2 className="text-3xl font-medium text-dark">
            {dict.sections.itinerary.num} {dict.sections.itinerary.title}
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan A */}
        <Card className="bg-white border border-dark rounded-[30px] overflow-hidden hover:-translate-y-2 transition-transform duration-300 shadow-[0px_5px_0px_0px_#191A23]">
          <div className="bg-dark/5 p-8">
            <Badge className="bg-dark text-white hover:bg-dark border-none px-3 py-1 text-md mb-4">
              {dict.sections.itinerary.plans.a.badge}
            </Badge>
            <h3 className="text-2xl font-bold text-dark mb-1">
              {dict.sections.itinerary.plans.a.title}
            </h3>
            <p className="text-dark/60">
              {dict.sections.itinerary.plans.a.desc}
            </p>
          </div>
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-dashed border-dark/20 pb-2">
              <span className="text-dark/50">
                {dict.sections.itinerary.plans.a.day1}
              </span>
              <span className="font-bold text-dark">
                {dict.sections.itinerary.plans.a.loc1}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-dark/20 pb-2">
              <span className="text-dark/50">
                {dict.sections.itinerary.plans.a.day2}
              </span>
              <span className="font-bold text-dark">
                {dict.sections.itinerary.plans.a.loc2}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-dark/50">
                {dict.sections.itinerary.plans.a.day3}
              </span>
              <span className="font-bold text-dark">
                {dict.sections.itinerary.plans.a.loc3}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Plan B */}
        <Card className="bg-dark text-white border border-dark rounded-[30px] overflow-hidden hover:-translate-y-2 transition-transform duration-300 shadow-[0px_5px_0px_0px_#191A23]">
          <div className="bg-white/10 p-8">
            <Badge className="bg-primary text-dark hover:bg-primary border-none px-3 py-1 text-md mb-4">
              {dict.sections.itinerary.plans.b.badge}
            </Badge>
            <h3 className="text-2xl font-bold text-white mb-1">
              {dict.sections.itinerary.plans.b.title}
            </h3>
            <p className="text-white/60">
              {dict.sections.itinerary.plans.b.desc}
            </p>
          </div>
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-dashed border-white/20 pb-2">
              <span className="text-white/50">
                {dict.sections.itinerary.plans.b.day1}
              </span>
              <span className="font-bold text-white">
                {dict.sections.itinerary.plans.b.loc1}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-dashed border-white/20 pb-2">
              <span className="text-white/50">
                {dict.sections.itinerary.plans.b.day2}
              </span>
              <span className="font-bold text-white">
                {dict.sections.itinerary.plans.b.loc2}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-white/50">
                {dict.sections.itinerary.plans.b.day3}
              </span>
              <span className="font-bold text-white">
                {dict.sections.itinerary.plans.b.loc3}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* More */}
        <Card className="bg-primary border border-dark rounded-[30px] flex flex-col items-center justify-center p-8 hover:-translate-y-2 transition-transform duration-300 cursor-pointer group shadow-[0px_5px_0px_0px_#191A23]">
          <div className="w-16 h-16 bg-dark text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-dark mb-2">
            {dict.sections.itinerary.plans.more.title}
          </h3>
          <p className="text-dark/70 text-center mb-6">
            {dict.sections.itinerary.plans.more.desc}
          </p>
          <div className="w-10 h-10 rounded-full border border-dark flex items-center justify-center">
            <span className="text-2xl mb-1">→</span>
          </div>
        </Card>
      </div>
    </section>
  );
}
