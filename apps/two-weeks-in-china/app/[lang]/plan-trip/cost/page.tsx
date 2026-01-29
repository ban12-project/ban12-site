import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Coins, CreditCard, Wallet } from 'lucide-react';
import { getDictionary, type Locale } from '#/lib/i18n';

export default async function TravelCostPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const t = dict.plan_trip.cost;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-dark">
          {t.title}
        </h1>
        <p className="text-xl text-dark/60 font-medium">Budgeting for 2026</p>
      </div>

      {/* Visa Fees */}
      <Card className="shadow-[0px_5px_0px_0px_#191A23] border border-dark rounded-2xl overflow-hidden">
        <CardHeader className="bg-dark text-white p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {t.visa_fee_title}
            </CardTitle>
            <span className="text-xs bg-primary text-dark px-2 py-1 rounded font-bold uppercase">
              Discounted
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="bg-primary/20 p-4 border-b border-primary/30 text-dark text-sm font-medium text-center">
            {t.visa_fee_msg}
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-8 text-center">
              <p className="text-dark/50 text-sm uppercase tracking-wide mb-2">
                USA Citizens
              </p>
              <p className="text-3xl font-bold text-dark">
                {t.visa_fee_us.split(':')[1]}
              </p>
            </div>
            <div className="p-8 text-center">
              <p className="text-dark/50 text-sm uppercase tracking-wide mb-2">
                Canada Citizens
              </p>
              <p className="text-3xl font-bold text-dark">
                {t.visa_fee_ca.split(':')[1]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Fees */}
      <section className="bg-white rounded-2xl p-8 border border-grey shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="bg-grey p-4 rounded-full">
          <CreditCard className="w-8 h-8 text-dark" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-dark">{t.payment_title}</h3>
          <p className="text-dark/80 leading-relaxed text-lg">
            {t.payment_desc}
          </p>
        </div>
      </section>

      {/* Daily Budget */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-dark" />
          <h3 className="text-2xl font-bold text-dark">{t.budget_title}</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-grey hover:border-dark transition-colors">
            <div className="text-sm font-bold text-dark/40 mb-2">
              BACKPACKER
            </div>
            <div className="text-2xl font-bold text-dark mb-4">
              {t.budget_eco.split('：')[1] || t.budget_eco.split(':')[1]}
            </div>
            <div className="h-1 w-12 bg-grey rounded-full" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-primary hover:border-dark transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-dark text-[10px] uppercase font-bold px-2 py-1 rounded-bl-lg">
              Popular
            </div>
            <div className="text-sm font-bold text-dark mb-2">MID-RANGE</div>
            <div className="text-2xl font-bold text-dark mb-4">
              {t.budget_mid.split('：')[1] || t.budget_mid.split(':')[1]}
            </div>
            <div className="h-1 w-12 bg-primary rounded-full" />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-grey hover:border-dark transition-colors">
            <div className="text-sm font-bold text-dark/40 mb-2">LUXURY</div>
            <div className="text-2xl font-bold text-dark mb-4">
              {t.budget_lux.split('：')[1] || t.budget_lux.split(':')[1]}
            </div>
            <div className="h-1 w-12 bg-dark rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
