import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { VISA_POLICIES, type Catalog, type ContentSnapshot,
  type Country, type MigrationManifest, type Page, type PageFrontmatter,
  type PageMetadata } from './types';

// Keep in step with lib/i18n.ts. Content must not import that server-only module
// into the standalone migration tools or client-side country types.
const LOCALES = new Set(['en', 'zh']);
const SHA256 = /^[a-f0-9]{64}$/;

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function record(value: unknown, label: string): Record<string, unknown> {
  invariant(typeof value === 'object' && value !== null && !Array.isArray(value), `${label}: expected an object`);
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, allowEmpty = false): string {
  invariant(typeof value === 'string' && (allowEmpty || value.trim().length > 0), `${label}: expected a string`);
  return value;
}

function nullableText(value: unknown, label: string): string | null {
  return value === null ? null : text(value, label, true);
}

function integer(value: unknown, label: string): number {
  invariant(typeof value === 'number' && Number.isSafeInteger(value) && value > 0, `${label}: expected a positive integer`);
  return value;
}

function timestamp(value: unknown, label: string): string {
  const result = text(value, label);
  // Preserve the original timestamp representation (including timestamp without
  // time zone); do not silently reinterpret legacy database timestamps as UTC.
  invariant(/^\d{4}-\d{2}-\d{2}[T ][\d:.]+(?:Z|[+-]\d{2}(?::?\d{2})?)?$/.test(result)
    && Number.isFinite(Date.parse(result)), `${label}: invalid timestamp`);
  return result;
}

export function validatePath(value: unknown): string {
  const path = text(value, 'path');
  invariant(path.startsWith('/') && !/[\\%?#\x00-\x20]/.test(path), `Unsafe content path: ${path}`);
  const parts = path.slice(1).split('/');
  invariant(parts.length >= 2 && LOCALES.has(parts[0]), `Unsupported locale or empty slug: ${path}`);
  invariant(parts.every((part) => /^[a-zA-Z0-9_-]+$/.test(part)), `Unsafe content path: ${path}`);
  invariant(parts[1] !== 'eligibility', `Content path conflicts with the eligibility route: ${path}`);
  return path;
}

function metadata(value: unknown): PageMetadata | null {
  if (value === null) return null;
  const result = record(value, 'metadata');
  for (const key of ['icon', 'href']) {
    if (result[key] !== undefined) text(result[key], `metadata.${key}`);
  }
  if (result.order !== undefined) {
    invariant(typeof result.order === 'number' && Number.isFinite(result.order), 'metadata.order must be finite');
  }
  if (result.tags !== undefined) {
    invariant(Array.isArray(result.tags) && result.tags.every((tag) => typeof tag === 'string'), 'metadata.tags must be strings');
  }
  return result as PageMetadata;
}

export function validateFrontmatter(value: unknown): PageFrontmatter {
  const row = record(value, 'frontmatter');
  const allowed = new Set(['id', 'path', 'title', 'subtitle', 'metadata', 'createdAt', 'updatedAt', 'draft']);
  for (const key of Object.keys(row)) invariant(allowed.has(key), `Unknown frontmatter field: ${key}`);
  invariant(typeof row.draft === 'boolean', 'frontmatter.draft must be explicitly true or false');
  const result: PageFrontmatter = {
    path: validatePath(row.path), title: text(row.title, 'title'),
    subtitle: row.subtitle === undefined ? null : nullableText(row.subtitle, 'subtitle'),
    metadata: row.metadata === undefined ? null : metadata(row.metadata),
    createdAt: timestamp(row.createdAt, 'createdAt'), updatedAt: timestamp(row.updatedAt, 'updatedAt'),
    draft: row.draft,
  };
  if (row.id !== undefined) result.id = integer(row.id, 'id');
  return result;
}

export function validateCountries(value: unknown): Country[] {
  invariant(Array.isArray(value) && value.length > 0, 'countries.json must contain the exported country rows, not an empty placeholder');
  const names = new Set<string>();
  const ids = new Set<number>();
  return value.map((item) => {
    const row = record(item, 'country');
    const allowed = new Set(['id', 'name', 'code', 'visaPolicy', 'policyDetails', 'createdAt', 'updatedAt']);
    for (const key of Object.keys(row)) invariant(allowed.has(key), `Unknown country field: ${key}`);
    const id = integer(row.id, 'country.id');
    const name = text(row.name, 'country.name');
    invariant(!names.has(name) && !ids.has(id), `Duplicate country name/id: ${name}`);
    names.add(name); ids.add(id);
    const code = nullableText(row.code, 'country.code');
    // The legacy column permits either ISO alpha-2 or alpha-3, and null.
    invariant(code === null || /^[A-Za-z]{2,3}$/.test(code), `Invalid country code: ${name}`);
    invariant(VISA_POLICIES.some((policy) => policy === row.visaPolicy), `Unknown visa policy: ${name}`);
    return {
      id, name, code, visaPolicy: row.visaPolicy as Country['visaPolicy'],
      policyDetails: nullableText(row.policyDetails, 'country.policyDetails'),
      createdAt: row.createdAt === null ? null : timestamp(row.createdAt, 'country.createdAt'),
      updatedAt: row.updatedAt === null ? null : timestamp(row.updatedAt, 'country.updatedAt'),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

/** Strict JSON frontmatter is a YAML-compatible subset; no YAML/JS evaluation. */
export function serializePage(frontmatter: PageFrontmatter, content: string): string {
  validateFrontmatter(frontmatter);
  invariant(typeof content === 'string', 'content must be a string');
  return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n${content}`;
}

export function parsePage(source: string, filename: string): Page {
  const format = filename.endsWith('.mdx') ? 'mdx' : 'md';
  invariant(/\.(md|mdx)$/.test(filename), `Unsupported content file: ${filename}`);
  const match = /^(?:\uFEFF)?---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(source);
  invariant(match, `Missing JSON frontmatter: ${filename}`);
  let value: unknown;
  try { value = JSON.parse(match[1]); } catch { throw new Error(`Invalid JSON frontmatter: ${filename}`); }
  const frontmatter = validateFrontmatter(value);
  const expected = `${frontmatter.path.slice(1)}.${format}`;
  invariant(filename.split(sep).join('/') === expected, `Path/file mismatch: ${filename} must be ${expected}`);
  const content = source.slice(match[0].length);
  invariant(frontmatter.draft || content.trim().length > 0, `Published content is empty: ${filename}`);
  return { ...frontmatter, content, format };
}

function filesUnder(directory: string): string[] {
  if (!existsSync(directory)) return [];
  invariant(!lstatSync(directory).isSymbolicLink(), `Symlink is not allowed in content: ${directory}`);
  return readdirSync(directory).sort().flatMap((name) => {
    const file = join(directory, name);
    const stat = lstatSync(file);
    invariant(!stat.isSymbolicLink(), `Symlink is not allowed in content: ${file}`);
    if (stat.isDirectory()) return filesUnder(file);
    invariant(stat.isFile() && /\.(md|mdx)$/.test(name), `Unexpected file in content/pages: ${file}`);
    return [file];
  });
}

function readJson(file: string): unknown {
  invariant(!lstatSync(file).isSymbolicLink(), `Symlink is not allowed in content: ${file}`);
  try { return JSON.parse(readFileSync(file, 'utf8')); } catch { throw new Error(`Invalid JSON: ${file}`); }
}

function manifest(value: unknown): MigrationManifest {
  const data = record(value, 'migration.json');
  invariant(data.version === 1 && data.status === 'complete',
    'Content migration is not complete. Export/import the original pages and countries before building; see README.md.');
  timestamp(data.exportedAt, 'migration.exportedAt');
  invariant(SHA256.test(text(data.sourceSha256, 'migration.sourceSha256')), 'Invalid source checksum');
  integer(data.pageCount, 'migration.pageCount'); integer(data.countryCount, 'migration.countryCount');
  invariant(Array.isArray(data.pages) && data.pages.length === data.pageCount, 'Invalid migration page count');
  const paths = new Set<string>();
  for (const entry of data.pages) {
    const page = record(entry, 'migration page');
    const path = validatePath(page.path);
    invariant(!paths.has(path), `Duplicate migration path: ${path}`); paths.add(path);
    invariant(SHA256.test(text(page.sha256, 'migration page sha256')), 'Invalid page checksum');
  }
  invariant(SHA256.test(text(data.countriesSha256, 'migration.countriesSha256')), 'Invalid country checksum');
  return data as unknown as MigrationManifest;
}

export function readCatalog(directory: string): Catalog {
  const root = resolve(directory);
  invariant(existsSync(root) && !lstatSync(root).isSymbolicLink(), 'Missing or symlinked content directory');
  invariant(existsSync(join(root, 'migration.json')), 'Missing content/migration.json: import the original content first');
  const migration = manifest(readJson(join(root, 'migration.json')));
  const pagesRoot = join(root, 'pages');
  const pages = filesUnder(pagesRoot).map((file) => parsePage(readFileSync(file, 'utf8'), relative(pagesRoot, file)));
  const paths = new Set<string>();
  const ids = new Set<number>();
  const filenames = new Set<string>();
  for (const page of pages) {
    invariant(!paths.has(page.path), `Duplicate content path: ${page.path}`); paths.add(page.path);
    // Also catch case-only filename collisions on macOS/Windows.
    invariant(!filenames.has(page.path.toLowerCase()), `Case-colliding content path: ${page.path}`);
    filenames.add(page.path.toLowerCase());
    if (page.id !== undefined) {
      invariant(!ids.has(page.id), `Duplicate legacy page id: ${page.id}`); ids.add(page.id);
    }
  }
  invariant(pages.length > 0, 'No article files found: migration must not publish an empty site');
  // Baseline paths may be edited after migration, but must not silently vanish
  // or become drafts. Deliberate removal requires a reviewed redirect/migration.
  for (const baseline of migration.pages) {
    invariant(pages.some((page) => page.path === baseline.path && !page.draft), `Missing published legacy path: ${baseline.path}`);
  }
  const countries = validateCountries(readJson(join(root, 'countries.json')));
  return { pages: pages.sort((a, b) => a.path.localeCompare(b.path, 'en')), countries, migration };
}

export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const object = value as Record<string, unknown>;
  return `{${Object.keys(object).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(object[key])}`).join(',')}}`;
}

export function checksum(value: unknown): string {
  return createHash('sha256').update(canonicalJson(value)).digest('hex');
}

export function validateSnapshot(value: unknown): ContentSnapshot {
  const data = record(value, 'export');
  invariant(data.version === 1, 'Unsupported export version');
  const exportedAt = timestamp(data.exportedAt, 'exportedAt');
  invariant(Array.isArray(data.pages) && data.pages.length > 0, 'The export has no pages; refusing an empty migration');
  const paths = new Set<string>();
  const ids = new Set<number>();
  const pages = data.pages.map((item) => {
    const row = record(item, 'exported page');
    const { content, ...fields } = row;
    const frontmatter = validateFrontmatter({ ...fields, draft: false });
    const id = integer(frontmatter.id, 'exported page.id');
    invariant(!paths.has(frontmatter.path) && !ids.has(id), `Duplicate exported page: ${frontmatter.path}`);
    paths.add(frontmatter.path); ids.add(id);
    const { draft: _draft, ...stored } = frontmatter;
    return { ...stored, id, content: text(content, 'page.content') };
  }).sort((a, b) => a.path.localeCompare(b.path, 'en'));
  return { version: 1, exportedAt, pages, countries: validateCountries(data.countries) };
}

export function createManifest(snapshot: ContentSnapshot): MigrationManifest {
  return {
    version: 1, status: 'complete', exportedAt: snapshot.exportedAt,
    sourceSha256: checksum(snapshot), pageCount: snapshot.pages.length, countryCount: snapshot.countries.length,
    pages: snapshot.pages.map((page) => ({ path: page.path, sha256: checksum(page) })),
    countriesSha256: checksum(snapshot.countries),
  };
}

/** A strict, one-time acceptance check; normal editing need not retain hashes. */
export function verifySnapshot(catalog: Catalog, snapshot: ContentSnapshot): void {
  invariant(catalog.migration.sourceSha256 === checksum(snapshot), 'Export does not match the migration manifest');
  invariant(catalog.migration.pageCount === snapshot.pages.length
    && catalog.migration.countryCount === snapshot.countries.length, 'Migration manifest count differs from the export');
  invariant(catalog.pages.length === snapshot.pages.length, 'Article count differs from the original export');
  invariant(catalog.countries.length === snapshot.countries.length, 'Country count differs from the original export');
  for (const original of snapshot.pages) {
    const page = catalog.pages.find((item) => item.path === original.path);
    invariant(page && !page.draft, `Missing exported page: ${original.path}`);
    const { format: _format, draft: _draft, ...stored } = page;
    invariant(checksum(stored) === checksum(original), `Article data differs from the export: ${original.path}`);
    invariant(catalog.migration.pages.some((item) => item.path === original.path && item.sha256 === checksum(original)),
      `Article manifest differs from the export: ${original.path}`);
  }
  invariant(checksum(catalog.countries) === checksum(snapshot.countries), 'Countries differ from the original export');
  invariant(catalog.migration.countriesSha256 === checksum(snapshot.countries), 'Country manifest differs from the export');
}

export const MENU_SECTIONS = [
  { key: 'plan_trip', prefix: 'plan-trip' }, { key: 'destinations', prefix: 'destinations' },
  { key: 'digital_survival', prefix: 'digital-survival' }, { key: 'itineraries', prefix: 'itineraries' },
  { key: 'entry_logistics', prefix: 'entry-logistics' }, { key: 'k_visa_business', prefix: 'k-visa-business' },
] as const;

export function publishedPages(pages: Page[]): Page[] {
  return pages.filter((page) => !page.draft);
}

export function pagesByPrefix(pages: Page[], prefix: string): Page[] {
  const normalized = prefix.replace(/\/$/, '');
  return publishedPages(pages).filter((page) => page.path === normalized || page.path.startsWith(`${normalized}/`));
}

export function buildMenu(pages: Page[], lang: string) {
  return MENU_SECTIONS.map((section) => ({
    title: section.key,
    children: pagesByPrefix(pages, `/${lang}/${section.prefix}`)
      .filter((page) => page.path.startsWith(`/${lang}/${section.prefix}/`))
      .map((page) => ({ title: page.title, href: page.path, icon: page.metadata?.icon || 'file-text',
        order: page.metadata?.order ?? 99, description: page.subtitle }))
      .sort((a, b) => a.order - b.order || a.href.localeCompare(b.href, 'en')),
  }));
}
