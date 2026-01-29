'use client';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { AlertCircle, CheckCircle2, Plane } from 'lucide-react';
import { useState } from 'react';
import type { Messages } from '#/lib/i18n';

// Simplified country lists for demo purposes
// In a real app, this would be a comprehensive library or API
const VISA_FREE_15_DAYS = [
  'France',
  'Germany',
  'Italy',
  'Spain',
  'Netherlands',
  'Malaysia',
];
const VISA_FREE_30_DAYS = ['Singapore', 'Thailand', 'United Arab Emirates'];

// 54 countries usually eligible for 144h/240h TWoV
const TWOV_ELIGIBLE = [
  'Austria',
  'Belgium',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Italy',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Poland',
  'Portugal',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Russia',
  'United Kingdom',
  'Ireland',
  'Cyprus',
  'Bulgaria',
  'Romania',
  'Ukraine',
  'Serbia',
  'Croatia',
  'Bosnia and Herzegovina',
  'Montenegro',
  'Macedonia',
  'Albania',
  'Monaco',
  'Belarus',
  'United States',
  'Canada',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'Australia',
  'New Zealand',
  'South Korea',
  'Japan',
  'Singapore',
  'Brunei',
  'UAE',
  'Qatar',
];

export function EligibilityChecker({ dict }: { dict: Messages }) {
  const [country, setCountry] = useState<string>('');
  const [result, setResult] = useState<
    keyof typeof dict.eligibility.form.result | null
  >(null);

  const checkEligibility = () => {
    if (!country) return;

    if (VISA_FREE_30_DAYS.includes(country)) {
      setResult('eligible_30d');
    } else if (VISA_FREE_15_DAYS.includes(country)) {
      setResult('eligible_15d');
    } else if (TWOV_ELIGIBLE.includes(country)) {
      setResult('eligible_240h');
    } else {
      setResult('visa_required');
    }
  };

  const reset = () => {
    setCountry('');
    setResult(null);
  };

  return (
    <Card className="w-full bg-white border border-dark shadow-[0px_5px_0px_0px_#191A23] rounded-[20px] overflow-hidden">
      <CardHeader className="bg-primary text-dark p-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold">
          <Plane className="h-6 w-6" />
          {dict.eligibility.heading}
        </CardTitle>
        <CardDescription className="text-dark/80 text-base">
          {dict.eligibility.subheading}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!result ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="country-select"
                className="text-sm font-medium text-gray-700"
              >
                {dict.eligibility.form.country_label}
              </label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger
                  id="country-select"
                  className="w-full h-12 text-lg rounded-xl border-gray-300"
                >
                  <SelectValue
                    placeholder={dict.eligibility.form.country_placeholder}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-75">
                  {/* Just a subset for the demo */}
                  {[
                    'United States',
                    'United Kingdom',
                    'Canada',
                    'Australia',
                    'France',
                    'Germany',
                    'Spain',
                    'Italy',
                    'Singapore',
                    'Malaysia',
                    'Japan',
                    'South Korea',
                    'Russia',
                    'Sweden',
                  ]
                    .sort()
                    .map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={checkEligibility}
              className="w-full h-12 text-lg font-bold rounded-xl"
              disabled={!country}
            >
              {dict.eligibility.form.check_btn}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              className={`p-6 rounded-xl border-2 ${
                result === 'visa_required'
                  ? 'bg-red-50 border-red-100'
                  : 'bg-green-50 border-green-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {result === 'visa_required' ? (
                  <AlertCircle className="h-8 w-8 text-red-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-green-500 shrink-0" />
                )}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {dict.eligibility.form.result[result]}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {matchDesc(result, dict)}
                  </p>
                </div>
              </div>
            </div>

            {/* Special Reminder for TWOV */}
            {(result === 'eligible_240h' || result === 'eligible_144h') && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <span className="font-bold">⚠️ IMPORTANT:</span>{' '}
                {dict.eligibility.form.result.abc_reminder}
              </div>
            )}

            <Button
              onClick={reset}
              variant="outline"
              className="w-full rounded-xl h-11"
            >
              {dict.eligibility.form.reset_btn}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 text-xs text-center text-gray-400 justify-center">
        {dict.eligibility.form.result.disclaimer}
      </CardFooter>
    </Card>
  );
}

function matchDesc(result: string, dict: Messages) {
  switch (result) {
    case 'eligible_15d':
      return dict.eligibility.form.result.desc_15d;
    case 'eligible_30d':
      return dict.eligibility.form.result.desc_30d;
    case 'eligible_240h':
      return dict.eligibility.form.result.desc_240h;
    case 'visa_required':
      return dict.eligibility.form.result.desc_visa;
    default:
      return '';
  }
}
