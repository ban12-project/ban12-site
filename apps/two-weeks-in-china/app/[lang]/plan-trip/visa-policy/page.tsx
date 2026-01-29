import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { FileText, Globe, Key } from 'lucide-react';
import { getDictionary, type Locale } from '#/lib/i18n';

export default async function VisaPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const t = dict.plan_trip.visa_policy;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-dark">
          {t.title}
        </h1>
        <p className="text-xl text-dark/60 font-medium">2026 Policy Update</p>
      </div>

      {/* 240h TWOV Section */}
      <section className="space-y-6">
        <Card className="bg-light overflow-hidden shadow-[0px_5px_0px_0px_#191A23] border border-dark">
          <div className="bg-primary p-1 h-2 w-full" />
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary text-dark hover:bg-primary/80 border-none">
                Key Policy
              </Badge>
            </div>
            <CardTitle className="text-2xl lg:text-3xl text-dark">
              {t.twov_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-dark/80">{t.twov_intro}</p>

            <div className="bg-white p-6 rounded-xl border border-grey shadow-sm">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                {t.twov_rule_title}
              </h3>
              <p className="mb-4 text-dark/80">{t.twov_rule_desc}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-primary/10 text-dark rounded-lg border border-primary/20">
                  {t.twov_rule_example_valid}
                </div>
                <div className="p-3 bg-grey text-dark rounded-lg border border-dark/10">
                  {t.twov_rule_example_invalid}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-grey shadow-sm">
              <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                {t.twov_region_title}
              </h3>
              <p className="text-dark/80">{t.twov_region_desc}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Unilateral Visa-Free */}
      <section>
        <Card className="shadow-[0px_5px_0px_0px_#191A23] border border-dark">
          <CardHeader>
            <CardTitle className="text-2xl">{t.unilateral_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-dark/80 text-lg leading-relaxed">
              {t.unilateral_desc}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Digital Arrival Card */}
      <section>
        <Card className="bg-dark text-white shadow-[0px_5px_0px_0px_#191A23] border border-dark">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">{t.arrival_card_title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-white/80 text-lg">{t.arrival_card_desc}</p>
            <div className="mt-6 flex gap-4">
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary" />
              </div>
            </div>
            <p className="text-sm text-white/40 mt-2">
              Rolling out progressively since Nov 2025
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
