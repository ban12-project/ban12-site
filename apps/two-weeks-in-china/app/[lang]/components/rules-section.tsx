import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Building, ChevronRight, FileCheck, Fingerprint } from 'lucide-react';
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Digital Arrival Card */}
        <Card className="bg-white shadow-[0px_5px_0px_0px_#191A23] border border-dark rounded-3xl p-6 lg:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <FileCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">
            {dict.sections.rules.arrival_card_title}
          </h3>
          <p className="text-gray-600 mb-6 grow">
            {dict.sections.rules.arrival_card_desc}
          </p>
          <Button className="w-full rounded-xl font-bold">
            {dict.sections.rules.arrival_card_cta}{' '}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>

        {/* Fingerprint Exemption */}
        <Card className="bg-white shadow-[0px_5px_0px_0px_#191A23] border border-dark rounded-3xl p-6 lg:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Fingerprint className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">
            {dict.sections.rules.fingerprint_title}
          </h3>
          <p className="text-gray-600">
            {dict.sections.rules.fingerprint_desc}
          </p>
        </Card>

        {/* Police Registration */}
        <Card className="bg-white shadow-[0px_5px_0px_0px_#191A23] border border-dark rounded-3xl p-6 lg:p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
            <Building className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-dark mb-2">
            {dict.sections.rules.police_reg_title}
          </h3>
          <p className="text-gray-600">{dict.sections.rules.police_reg_desc}</p>
        </Card>
      </div>
    </section>
  );
}
