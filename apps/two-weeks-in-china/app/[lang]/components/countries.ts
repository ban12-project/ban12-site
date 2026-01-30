// Unilateral 15 days visa-free
export const VISA_FREE_15_DAYS = [
  'France',
  'Germany',
  'Italy',
  'Netherlands',
  'Spain',
  'Malaysia',
  'Switzerland',
  'Ireland',
  'Hungary',
  'Austria',
  'Belgium',
  'Luxembourg',
  'New Zealand',
  'Australia',
  'South Korea',
];

// Mutual visa exemption (30 days)
export const VISA_FREE_30_DAYS = [
  'Singapore',
  'Thailand',
  'Georgia',
  'United Arab Emirates', // Added to match policy roughly, assuming mutual exemption
];

export const VISA_FREE_COUNTRIES = [...VISA_FREE_15_DAYS, ...VISA_FREE_30_DAYS];

// Based on the 55 countries list for 72/144 (now 240) hour transit
export const TRANSIT_240H_COUNTRIES = [
  // Europe Schengen (25)
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
  'Norway',
  // Europe Other (15)
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
  'North Macedonia',
  'Albania',
  'Belarus',
  'Monaco',
  // Americas (6)
  'United States',
  'Canada',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  // Oceania (2)
  'Australia',
  'New Zealand',
  // Asia (7)
  'South Korea',
  'Japan',
  'Singapore',
  'Brunei',

  'Qatar',
  'Indonesia',
];

// All countries for the dropdown
export const ALL_COUNTRIES = Array.from(
  new Set([
    ...VISA_FREE_COUNTRIES,
    ...TRANSIT_240H_COUNTRIES,
    // Add some other common countries that might need visa
    'India',
    'Philippines',
    'Vietnam',
    'Turkey',
    'Egypt',
    'South Africa',
    'Nigeria',
    'Pakistan',
    'Bangladesh',
  ]),
).sort();
