import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  AlertTriangle,
  Car,
  Coffee,
  Droplets,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { getDictionary, type Locale } from '#/lib/i18n';

export default async function SafetyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const t = dict.plan_trip.safety;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-dark">
          {t.title}
        </h1>
        <p className="text-xl text-dark/60 font-medium">Safe Travel Guide</p>
      </div>

      {/* General Safety */}
      <section className="bg-primary/20 rounded-[30px] p-8 lg:p-12 flex flex-col md:flex-row items-center gap-8 border border-primary/50">
        <div className="bg-white p-6 rounded-full shadow-sm shrink-0">
          <ShieldCheck className="w-12 h-12 text-dark" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-dark mb-4">
            {t.general_title}
          </h2>
          <p className="text-dark/90 text-lg leading-relaxed">
            {t.general_desc}
          </p>
        </div>
      </section>

      {/* Scams */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-dark" />
          Common Scams
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-[0px_5px_0px_0px_#191A23] border border-dark hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coffee className="w-5 h-5 text-dark" />
                {t.scam_tea_title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark/80 leading-relaxed">{t.scam_tea_desc}</p>
            </CardContent>
          </Card>
          <Card className="shadow-[0px_5px_0px_0px_#191A23] border border-dark hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="w-5 h-5 text-dark" />
                {t.scam_taxi_title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-dark/80 leading-relaxed">{t.scam_taxi_desc}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Essentials */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white shadow-[0px_5px_0px_0px_#191A23] border border-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Droplets className="w-6 h-6 text-dark" />
              {t.health_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dark/80 text-lg">{t.health_water}</p>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-[0px_5px_0px_0px_#191A23] border border-dark">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Smartphone className="w-6 h-6 text-dark" />
              {t.digital_title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dark/80 text-lg">{t.digital_vpn}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
