'use server';

import { getCountryByName } from '../db/queries';
import type { VisaPolicyType } from '../db/schema/countries';

export type EligibilityResult = {
  policy: VisaPolicyType;
  details: string | null;
  found: boolean;
};

export async function checkEligibility(
  countryName: string,
): Promise<EligibilityResult> {
  const country = await getCountryByName(countryName);

  if (!country) {
    return { policy: 'visa_required', details: null, found: false };
  }

  return {
    policy: country.visaPolicy,
    details: country.policyDetails,
    found: true,
  };
}
