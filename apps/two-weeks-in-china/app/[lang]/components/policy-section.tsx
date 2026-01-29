import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { CheckCircle2 } from 'lucide-react';
import type { Messages } from '#/lib/i18n';

export function PolicySection({ dict }: { dict: Messages }) {
  return (
    <section id="policy" className="grid gap-10 scroll-mt-24">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-2 rounded-[7px]">
          <h2 className="text-3xl font-medium text-dark">
            {dict.sections.policy.num} {dict.sections.policy.title}
          </h2>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-grey border-none shadow-none rounded-[30px] p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-3xl font-medium text-dark bg-primary w-fit px-2">
              {dict.sections.policy.card_twov_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <p className="text-dark text-lg leading-relaxed">
              {dict.sections.policy.card_twov_p1}
              <br />
              <br />
              {dict.sections.policy.card_twov_p2}
            </p>
            <ul className="space-y-3 pt-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-dark text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-dark text-lg">
                  {dict.sections.policy.card_twov_list1}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-dark text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
                <span className="text-dark text-lg">
                  {dict.sections.policy.card_twov_list2}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-dark text-white border-none shadow-none rounded-[30px] p-8 flex flex-col justify-between">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-3xl font-medium text-white border border-white w-fit px-4 py-1 rounded-full">
              {dict.sections.policy.card_unilateral_badge}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <p className="text-slate-300 text-lg leading-relaxed">
              {dict.sections.policy.card_unilateral_desc}
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-[14px] border border-white/20">
                <span className="text-primary font-bold text-2xl">
                  {dict.sections.policy.card_unilateral_stat1_val}
                </span>
                <span className="text-lg">
                  {dict.sections.policy.card_unilateral_stat1_label}
                </span>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-[14px] border border-white/20">
                <span className="text-primary font-bold text-2xl">
                  {dict.sections.policy.card_unilateral_stat2_val}
                </span>
                <span className="text-lg">
                  {dict.sections.policy.card_unilateral_stat2_label}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
