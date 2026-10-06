import 'server-only';

import { join } from 'node:path';
import { cache } from 'react';
import { buildMenu, pagesByPrefix, publishedPages, readCatalog } from './core';
import type { VisaPolicyType } from './types';

async function getCatalog() {
  'use cache';
  return readCatalog(join(process.cwd(), 'content'));
}

export async function getAllCountries() {
  return (await getCatalog()).countries;
}

export async function getCountryByName(name: string) {
  return (await getAllCountries()).find((country) => country.name === name);
}

export async function getCountriesByPolicy(policy: VisaPolicyType) {
  return (await getAllCountries()).filter(
    (country) => country.visaPolicy === policy,
  );
}

export async function getAllPages() {
  return publishedPages((await getCatalog()).pages);
}

export const getPageByPath = cache(async (path: string) => {
  return (await getAllPages()).find((page) => page.path === path);
});

export async function getPagesByPathPrefix(prefix: string) {
  return pagesByPrefix(await getAllPages(), prefix).sort(
    (a, b) =>
      (a.metadata?.order ?? 99) - (b.metadata?.order ?? 99) ||
      a.path.localeCompare(b.path, 'en'),
  );
}

export async function getGlobalMenu(lang: string) {
  return buildMenu(await getAllPages(), lang);
}
