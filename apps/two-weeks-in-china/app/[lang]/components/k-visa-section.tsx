'use client';

import { Badge } from '@repo/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { CheckCircle, GraduationCap, Rocket } from 'lucide-react';
import type { Messages } from '#/lib/i18n';

export function KVisaSection({ dict }: { dict: Messages }) {
  return (
    <section id="k-visa" className="grid gap-8 scroll-mt-24">
      <div className="flex items-center gap-4">
        <div className="bg-primary p-2 rounded-[7px]">
          <h2 className="text-3xl font-medium text-dark">
            {dict.sections.k_visa.num} {dict.sections.k_visa.title}
          </h2>
        </div>
      </div>

      <Card className="bg-dark shadow-[0px_5px_0px_0px_#191A23] border border-dark rounded-[30px] overflow-hidden text-white">
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="bg-primary text-dark hover:bg-primary/90 mb-4 text-sm font-bold px-3 py-1">
                {dict.sections.k_visa.subtitle}
              </Badge>
              <CardTitle className="text-3xl font-bold mb-2">
                China STEM K-Visa
              </CardTitle>
            </div>
            <GraduationCap className="w-12 h-12 text-primary opacity-80" />
          </div>
          <CardDescription className="text-gray-300 text-lg max-w-2xl">
            {dict.sections.k_visa.desc}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="p-3 bg-blue-500/20 rounded-full w-fit mb-4">
                <GraduationCap className="w-6 h-6 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {dict.sections.k_visa.feature1_title}
              </h3>
              <p className="text-gray-300">
                {dict.sections.k_visa.feature1_desc}
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="p-3 bg-green-500/20 rounded-full w-fit mb-4">
                <CheckCircle className="w-6 h-6 text-green-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {dict.sections.k_visa.feature2_title}
              </h3>
              <p className="text-gray-300">
                {dict.sections.k_visa.feature2_desc}
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="p-3 bg-purple-500/20 rounded-full w-fit mb-4">
                <Rocket className="w-6 h-6 text-purple-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">
                {dict.sections.k_visa.feature3_title}
              </h3>
              <p className="text-gray-300">
                {dict.sections.k_visa.feature3_desc}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
