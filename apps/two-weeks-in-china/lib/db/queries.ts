import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { cache } from 'react';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

import * as schema from './schema';

export const db = drizzle({ client: sql, schema });

// Get all countries ordered by name (for dropdown)
// Cached since country data rarely changes
export async function getAllCountries() {
  'use cache';
  return db.query.countries.findMany({
    orderBy: (countries, { asc }) => [asc(countries.name)],
  });
}

// Get country by name for eligibility check
export async function getCountryByName(name: string) {
  return db.query.countries.findFirst({
    where: (countries, { eq }) => eq(countries.name, name),
  });
}

// Get page by full path (e.g., "/en/plan-trip/visa-policy")
// Wrapped with React.cache() for per-request deduplication
// (generateMetadata and Page both call this with the same path)
// Uses "use cache" for cross-request caching
export const getPageByPath = cache(async (path: string) => {
  'use cache';
  return db.query.pages.findFirst({
    where: (pages, { eq }) => eq(pages.path, path),
  });
});

// Get all pages matching a path prefix (for menu assembly)
// e.g., "/en/plan-trip" returns all pages under plan-trip section
export async function getPagesByPathPrefix(prefix: string) {
  return db.query.pages.findMany({
    where: (pages, { like }) => like(pages.path, `${prefix}%`),
    orderBy: (pages, { asc }) => [asc(pages.metadata)],
  });
}

// Get all pages for static generation
export async function getAllPages() {
  return db.query.pages.findMany();
}

// Get countries by visa policy
// Cached since policy data rarely changes
export async function getCountriesByPolicy(policy: schema.VisaPolicyType) {
  'use cache';
  return db.query.countries.findMany({
    where: (countries, { eq }) => eq(countries.visaPolicy, policy),
    orderBy: (countries, { asc }) => [asc(countries.name)],
  });
}

const MENU_SECTIONS = [
  { key: 'plan_trip', prefix: 'plan-trip' },
  { key: 'destinations', prefix: 'destinations' },
  { key: 'digital_survival', prefix: 'digital-survival' },
  { key: 'itineraries', prefix: 'itineraries' },
  { key: 'entry_logistics', prefix: 'entry-logistics' },
  { key: 'k_visa_business', prefix: 'k-visa-business' },
] as const;

export async function getGlobalMenu(lang: string) {
  'use cache';
  const allPages = await db.query.pages.findMany({
    where: (pages, { like }) => like(pages.path, `/${lang}/%`),
  });

  return MENU_SECTIONS.map((section) => {
    const sectionPages = allPages.filter((page) =>
      page.path.startsWith(`/${lang}/${section.prefix}/`),
    );

    const children = sectionPages
      .map((page) => ({
        title: page.title,
        href: page.path,
        icon: page.metadata?.icon || 'file-text',
        order: page.metadata?.order ?? 99,
        // We might want to pass description/subtitle if needed for desktop menu
        description: page.subtitle,
      }))
      .sort((a, b) => a.order - b.order);

    return {
      title: section.key,
      children,
    };
  });
}
