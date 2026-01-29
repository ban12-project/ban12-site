import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { AlertOctagon, CloudRain, Snowflake, Sun } from 'lucide-react';
import { getDictionary, type Locale } from '#/lib/i18n';

export default async function BestTimePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const t = dict.plan_trip.best_time;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-dark">
          {t.title}
        </h1>
        <p className="text-xl text-dark/60 font-medium">Seasonality & Crowds</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Spring */}
        <Card className="bg-light shadow-[0px_5px_0px_0px_#191A23] border border-dark overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-32 bg-primary flex items-center justify-center">
            <Sun className="w-16 h-16 text-dark opacity-80" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl text-dark">
              {t.spring_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dark/80 font-medium">{t.spring_desc}</p>
          </CardContent>
        </Card>

        {/* Autumn */}
        <Card className="bg-light shadow-[0px_5px_0px_0px_#191A23] border border-dark overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-32 bg-grey flex items-center justify-center">
            <CloudRain className="w-16 h-16 text-dark opacity-80" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl text-dark">
              {t.autumn_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dark/80 font-medium">{t.autumn_desc}</p>
          </CardContent>
        </Card>
      </div>

      {/* Red Alert Dates */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-dark">
          <AlertOctagon className="w-8 h-8" />
          <h2 className="text-2xl font-bold">{t.avoid_title}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="border-l-4 border-dark bg-white p-6 shadow-sm rounded-r-xl">
            <h3 className="font-bold text-lg mb-2 text-dark">
              Spring Festival
            </h3>
            <p className="text-dark/60 text-sm">{t.avoid_cny}</p>
          </div>
          <div className="border-l-4 border-dark bg-white p-6 shadow-sm rounded-r-xl">
            <h3 className="font-bold text-lg mb-2 text-dark">Labor Day</h3>
            <p className="text-dark/60 text-sm">{t.avoid_labor}</p>
          </div>
          <div className="border-l-4 border-dark bg-white p-6 shadow-sm rounded-r-xl">
            <h3 className="font-bold text-lg mb-2 text-dark">National Day</h3>
            <p className="text-dark/60 text-sm">{t.avoid_national}</p>
          </div>
        </div>
      </section>

      {/* 2026 Rec */}
      <Card className="bg-dark text-white echo shadow-[0px_5px_0px_0px_#191A23] border border-dark py-8">
        <CardContent className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <Snowflake className="w-16 h-16 text-primary shrink-0" />
          <div>
            <h3 className="text-2xl font-bold mb-2">2026 Recommendation</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              {t.rec_2026}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
