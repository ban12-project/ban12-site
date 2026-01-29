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
import { Label } from '@repo/ui/components/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  AlertCircle,
  CheckCircle2,
  Plane,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Fragment, useState } from 'react';
import type { Messages } from '#/lib/i18n';
import {
  ALL_COUNTRIES,
  TRANSIT_240H_COUNTRIES,
  VISA_FREE_COUNTRIES,
} from './countries';

const groupedCountries = ALL_COUNTRIES.reduce(
  (acc, country) => {
    const letter = country[0].toUpperCase();
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(country);
    return acc;
  },
  {} as Record<string, string[]>,
);

const letters = Object.keys(groupedCountries).sort();

export function EligibilityForm({ dict }: { dict: Messages }) {
  const [country, setCountry] = useState<string>('');
  const [result, setResult] = useState<
    'visa_free' | 'transit_240h' | 'visa_required' | null
  >(null);

  const handleCheck = () => {
    if (!country) return;

    if (VISA_FREE_COUNTRIES.includes(country)) {
      setResult('visa_free');
    } else if (TRANSIT_240H_COUNTRIES.includes(country)) {
      setResult('transit_240h');
    } else {
      setResult('visa_required');
    }
  };

  const handleReset = () => {
    setCountry('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card className="shadow-[0px_5px_0px_0px_#191A23] border border-dark">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {dict.eligibility.heading}
          </CardTitle>
          <CardDescription className="text-center">
            {dict.eligibility.subheading}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!result ? (
            <div className="space-y-4">
              <Label htmlFor="country">
                {dict.eligibility.form.country_label}
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger id="country" className="w-full h-12 text-lg">
                  <SelectValue
                    placeholder={dict.eligibility.form.country_placeholder}
                  />
                </SelectTrigger>
                <SelectContent className="max-h-75">
                  {letters.map((letter, index) => (
                    <Fragment key={letter}>
                      <SelectGroup>
                        <SelectLabel className="sticky">{letter}</SelectLabel>
                        {groupedCountries[letter].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      {index < letters.length - 1 && <SelectSeparator />}
                    </Fragment>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="Other">Other / Not Listed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="w-full h-12 text-lg font-semibold"
                onClick={handleCheck}
                disabled={!country}
              >
                {dict.eligibility.form.check_btn}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              {result === 'visa_free' && (
                <div className="flex flex-col items-center text-center space-y-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                  <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
                  <h3 className="text-xl font-bold">
                    {dict.eligibility.form.result.eligible_15d} / 30D
                  </h3>
                  <p className="max-w-xs">
                    {dict.eligibility.form.result.desc_15d}
                  </p>
                </div>
              )}

              {result === 'transit_240h' && (
                <div className="flex flex-col items-center text-center space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300">
                  <Plane className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold">
                    {dict.eligibility.form.result.eligible_240h}
                  </h3>
                  <p className="max-w-xs">
                    {dict.eligibility.form.result.desc_240h}
                  </p>
                  <div className="w-full bg-white dark:bg-blue-950 p-3 rounded text-sm text-left border border-blue-100 dark:border-blue-900 mt-2">
                    <p className="font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <AlertCircle className="w-4 h-4" />
                      {dict.eligibility.form.result.abc_reminder}
                    </p>
                  </div>
                </div>
              )}

              {result === 'visa_required' && (
                <div className="flex flex-col items-center text-center space-y-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
                  <XCircle className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-xl font-bold">
                    {dict.eligibility.form.result.visa_required}
                  </h3>
                  <p className="max-w-xs">
                    {dict.eligibility.form.result.desc_visa}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleReset}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {dict.eligibility.form.reset_btn}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground text-center">
          {dict.eligibility.form.result.disclaimer}
        </CardFooter>
      </Card>
    </div>
  );
}
