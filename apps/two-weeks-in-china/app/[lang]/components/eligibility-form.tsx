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
import { cn } from '@repo/ui/lib/utils';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plane,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Fragment, useState, useTransition } from 'react';
import { checkEligibility, type EligibilityResult } from '#/lib/actions';
import type { Country } from '#/lib/db/schema/countries';
import type { Messages } from '#/lib/i18n';

interface Props extends React.ComponentProps<typeof Card> {
  dict: Messages;
  countries: Country[];
}

function groupCountriesByLetter(countries: Country[]) {
  return countries.reduce(
    (acc, country) => {
      const letter = country.name[0].toUpperCase();
      if (!acc[letter]) {
        acc[letter] = [];
      }
      acc[letter].push(country);
      return acc;
    },
    {} as Record<string, Country[]>,
  );
}

export function EligibilityForm({ dict, countries, ...props }: Props) {
  const [country, setCountry] = useState<string>('');
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const groupedCountries = groupCountriesByLetter(countries);
  const letters = Object.keys(groupedCountries).sort();

  const handleCheck = () => {
    if (!country) return;

    startTransition(async () => {
      const eligibility = await checkEligibility(country);
      setResult(eligibility);
    });
  };

  const handleReset = () => {
    setCountry('');
    setResult(null);
  };

  return (
    <Card
      {...props}
      className={cn(
        'shadow-[0px_5px_0px_0px_#191A23] border border-dark bg-primary',
        props.className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-2xl text-center bg-white text-dark w-fit mx-auto px-2 py-1 rounded">
          {dict.eligibility.heading}
        </CardTitle>
        <CardDescription className="text-center">
          {dict.eligibility.subheading}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {!result ? (
          <div className="space-y-4">
            <Label htmlFor="country" className="text-dark font-medium">
              {dict.eligibility.form.country_label}
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger
                id="country"
                className="w-full h-12 text-lg bg-white border-dark shadow-[2px_2px_0px_0px_#191A23]"
              >
                <SelectValue
                  placeholder={dict.eligibility.form.country_placeholder}
                />
              </SelectTrigger>
              <SelectContent className="max-h-75 border-dark">
                {letters.map((letter, index) => (
                  <Fragment key={letter}>
                    <SelectGroup>
                      <SelectLabel className="sticky">{letter}</SelectLabel>
                      {groupedCountries[letter].map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
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
              className="w-full h-12 text-lg font-semibold bg-dark text-white hover:bg-dark/80"
              onClick={handleCheck}
              disabled={!country || isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                dict.eligibility.form.check_btn
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            {result.policy === 'visa_free_15' && (
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-white rounded-xl border border-dark text-dark shadow-[0px_3px_0px_0px_#191A23]">
                <CheckCircle2 className="w-16 h-16 text-dark" />
                <h3 className="text-xl font-bold">
                  {dict.eligibility.form.result.eligible_15d}
                </h3>
                <p className="max-w-xs">
                  {dict.eligibility.form.result.desc_15d}
                </p>
              </div>
            )}

            {result.policy === 'visa_free_30' && (
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-white rounded-xl border border-dark text-dark shadow-[0px_3px_0px_0px_#191A23]">
                <CheckCircle2 className="w-16 h-16 text-dark" />
                <h3 className="text-xl font-bold">
                  {dict.eligibility.form.result.eligible_30d}
                </h3>
                <p className="max-w-xs">
                  {dict.eligibility.form.result.desc_30d}
                </p>
              </div>
            )}

            {result.policy === 'transit_240h' && (
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-white rounded-xl border border-dark text-dark shadow-[0px_3px_0px_0px_#191A23]">
                <Plane className="w-16 h-16 text-dark" />
                <h3 className="text-xl font-bold">
                  {dict.eligibility.form.result.eligible_240h}
                </h3>
                <p className="max-w-xs">
                  {dict.eligibility.form.result.desc_240h}
                </p>
                <div className="w-full bg-grey p-3 rounded text-sm text-left border border-dark mt-2">
                  <p className="font-semibold flex items-center gap-2 text-dark">
                    <AlertCircle className="w-4 h-4" />
                    {dict.eligibility.form.result.abc_reminder}
                  </p>
                </div>
              </div>
            )}

            {result.policy === 'visa_required' && (
              <div className="flex flex-col items-center text-center space-y-3 p-4 bg-white rounded-xl border border-dark text-dark shadow-[0px_3px_0px_0px_#191A23]">
                <XCircle className="w-16 h-16 text-dark" />
                <h3 className="text-xl font-bold">
                  {dict.eligibility.form.result.visa_required}
                </h3>
                <p className="max-w-xs">
                  {dict.eligibility.form.result.desc_visa}
                </p>
              </div>
            )}

            <Button
              className="w-full h-12 text-lg font-semibold bg-dark text-white hover:bg-dark/80"
              onClick={handleReset}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {dict.eligibility.form.reset_btn}
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground text-center">
        {dict.eligibility.form.result.disclaimer}
      </CardFooter>
    </Card>
  );
}
