import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, test } from 'node:test';
import {
  buildMenu,
  canonicalJson,
  checksum,
  createManifest,
  pagesByPrefix,
  parsePage,
  publishedPages,
  readCatalog,
  serializePage,
  validateCountries,
  validateFrontmatter,
  validatePath,
  validateSnapshot,
  verifySnapshot,
} from '../lib/content/core';
import type {
  ContentSnapshot,
  Page,
  PageFrontmatter,
} from '../lib/content/types';

// Synthetic fixtures only. They are never copied into production content.
const directories: string[] = [];
function directory() {
  const path = mkdtempSync(join(tmpdir(), 'two-weeks-content-test-'));
  directories.push(path);
  return path;
}
afterEach(() => {
  for (const path of directories.splice(0))
    rmSync(path, { recursive: true, force: true });
});
function frontmatter(
  overrides: Partial<PageFrontmatter> = {},
): PageFrontmatter {
  return {
    id: 1,
    path: '/en/plan-trip/fixture',
    title: 'Synthetic test article',
    subtitle: null,
    metadata: {
      order: 3,
      icon: 'plane',
      tags: ['test'],
      extra: { preserved: true },
    },
    createdAt: '2025-01-01T12:00:00',
    updatedAt: '2025-01-02T12:00:00.123456',
    draft: false,
    ...overrides,
  };
}
function page(overrides: Partial<Page> = {}): Page {
  return {
    ...frontmatter(),
    content: 'Synthetic content\n',
    format: 'md',
    ...overrides,
  };
}
function snapshot(): ContentSnapshot {
  const { draft: _draft, ...fields } = frontmatter();
  return {
    version: 1,
    exportedAt: '2026-09-06T01:00:00Z',
    pages: [
      {
        ...fields,
        id: 1,
        content:
          '\n<InfoBox title="Fixture">\r\n\n**正文** 🌏\r\n\n</InfoBox>\n',
      },
    ],
    countries: [
      {
        id: 1,
        name: 'Synthetic fixture country',
        code: 'ZZ',
        visaPolicy: 'visa_required',
        policyDetails: null,
        createdAt: null,
        updatedAt: null,
      },
    ],
  };
}

// The production importer has been retired. Build synthetic file fixtures directly;
// tests must not depend on Neon, psql, migration CLIs or production content.
function fixtureCatalog() {
  const root = directory();
  const data = validateSnapshot(snapshot());
  for (const { content, ...fields } of data.pages) {
    const file = join(root, 'pages', `${fields.path.slice(1)}.mdx`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, serializePage({ ...fields, draft: false }, content));
  }
  writeFileSync(join(root, 'countries.json'), JSON.stringify(data.countries));
  writeFileSync(
    join(root, 'migration.json'),
    JSON.stringify(createManifest(data)),
  );
  return { root, data, catalog: readCatalog(root) };
}

test('frontmatter and body round-trip without trimming or newline changes', () => {
  const body = snapshot().pages[0].content;
  const result = parsePage(
    serializePage(frontmatter(), body),
    'en/plan-trip/fixture.mdx',
  );
  assert.deepEqual(Buffer.from(result.content), Buffer.from(body));
  assert.equal(result.format, 'mdx');
  assert.equal(result.updatedAt, '2025-01-02T12:00:00.123456');
  assert.deepEqual(result.metadata?.extra, { preserved: true });
});
test('plain Markdown has md format and keeps braces as content', () => {
  assert.equal(
    parsePage(
      serializePage(frontmatter(), 'Use {braces} and <literal>'),
      'en/plan-trip/fixture.md',
    ).format,
    'md',
  );
});
test('CRLF frontmatter is supported without rewriting CRLF body', () => {
  const source = `---\r\n${JSON.stringify(frontmatter(), null, 2)}\r\n---\r\nbody\r\n`;
  assert.equal(
    parsePage(source, 'en/plan-trip/fixture.md').content,
    'body\r\n',
  );
});
test('invalid JSON frontmatter fails instead of evaluating JavaScript', () => {
  assert.throws(
    () =>
      parsePage('---\n{draft: false}\n---\nbody', 'en/plan-trip/fixture.md'),
    /Invalid JSON/,
  );
});
test('missing frontmatter and unsupported extension fail', () => {
  assert.throws(
    () => parsePage('body', 'en/plan-trip/fixture.md'),
    /Missing JSON/,
  );
  assert.throws(
    () => parsePage('body', 'en/plan-trip/fixture.txt'),
    /Unsupported content file/,
  );
});
test('filename must match canonical path and locale', () => {
  assert.throws(
    () =>
      parsePage(
        serializePage(frontmatter(), 'body'),
        'zh/plan-trip/fixture.md',
      ),
    /Path\/file mismatch/,
  );
});
test('draft flag is mandatory and typed', () => {
  assert.throws(
    () => validateFrontmatter({ ...frontmatter(), draft: undefined }),
    /explicitly/,
  );
  assert.throws(
    () => validateFrontmatter({ ...frontmatter(), draft: 'false' }),
    /explicitly/,
  );
});
test('unknown frontmatter fields fail rather than silently disappearing', () => {
  assert.throws(
    () => validateFrontmatter({ ...frontmatter(), published: true }),
    /Unknown frontmatter/,
  );
});
test('published empty body fails while an empty draft is permitted', () => {
  assert.throws(
    () =>
      parsePage(serializePage(frontmatter(), ' \n'), 'en/plan-trip/fixture.md'),
    /empty/,
  );
  assert.equal(
    parsePage(
      serializePage(frontmatter({ draft: true }), ''),
      'en/plan-trip/fixture.md',
    ).content,
    '',
  );
});
test('unsafe, unsupported and conflicting paths fail', () => {
  for (const path of [
    '/en/../secret',
    '/en/%2e%2e/secret',
    '/en//file',
    '/en/file/',
    '/en/a?b',
    '/en/a#b',
    '/en/a b',
    '/en/a\n',
    '/en/a\u0000',
    '/en/a\\b',
    '/fr/a',
    '/en',
    '/en/eligibility',
    '/en/eligibility/child',
  ]) {
    assert.throws(() => validatePath(path));
  }
  assert.equal(validatePath('/zh/plan-trip/guide-1'), '/zh/plan-trip/guide-1');
});
test('metadata is validated, including tag arrays and finite order', () => {
  assert.throws(
    () => validateFrontmatter(frontmatter({ metadata: { order: Number.NaN } })),
    /finite/,
  );
  assert.throws(
    () => validateFrontmatter({ ...frontmatter(), metadata: { tags: [3] } }),
    /tags/,
  );
});
test('nullable legacy fields and two/three-letter country codes survive', () => {
  const country = snapshot().countries[0];
  for (const code of [null, 'ZZ', 'ZZZ'])
    assert.equal(validateCountries([{ ...country, code }])[0].code, code);
  assert.equal(validateCountries([country])[0].createdAt, null);
  assert.equal(validateCountries([country])[0].policyDetails, null);
});
test('duplicate country names and IDs fail', () => {
  const country = snapshot().countries[0];
  assert.throws(
    () => validateCountries([country, { ...country, id: 2 }]),
    /Duplicate/,
  );
  assert.throws(
    () => validateCountries([country, { ...country, name: 'Other fixture' }]),
    /Duplicate/,
  );
});
test('empty countries, unknown policies and unknown fields fail', () => {
  assert.throws(() => validateCountries([]), /empty placeholder/);
  assert.throws(
    () =>
      validateCountries([
        { ...snapshot().countries[0], visaPolicy: 'invented' },
      ]),
    /Unknown visa policy/,
  );
  assert.throws(
    () => validateCountries([{ ...snapshot().countries[0], extra: 1 }]),
    /Unknown country field/,
  );
});
test('snapshot rejects empty tables and duplicate article IDs or paths', () => {
  const data = snapshot();
  assert.throws(() => validateSnapshot({ ...data, pages: [] }), /no pages/);
  assert.throws(
    () => validateSnapshot({ ...data, countries: [] }),
    /empty placeholder/,
  );
  assert.throws(
    () =>
      validateSnapshot({
        ...data,
        pages: [data.pages[0], { ...data.pages[0], id: 2 }],
      }),
    /Duplicate/,
  );
  assert.throws(
    () =>
      validateSnapshot({
        ...data,
        pages: [data.pages[0], { ...data.pages[0], path: '/en/other' }],
      }),
    /Duplicate/,
  );
});
test('canonical checksums ignore object key order, not content changes', () => {
  assert.equal(canonicalJson({ b: 2, a: 1 }), '{"a":1,"b":2}');
  assert.equal(checksum({ b: 2, a: 1 }), checksum({ a: 1, b: 2 }));
  assert.notEqual(checksum('body'), checksum('body\n'));
});
test('drafts are absent from published pages and section navigation', () => {
  const pages = [
    page(),
    page({ id: 2, path: '/en/plan-trip/draft', draft: true }),
  ];
  assert.equal(publishedPages(pages).length, 1);
  assert.equal(buildMenu(pages, 'en')[0].children.length, 1);
  assert.equal(buildMenu(pages, 'zh')[0].children.length, 0);
});
test('prefix matching respects path segments', () => {
  const pages = [page(), page({ id: 2, path: '/en/plan-tripper/other' })];
  assert.equal(pagesByPrefix(pages, '/en/plan-trip').length, 1);
  assert.equal(pagesByPrefix(pages, '/en/plan-trip/').length, 1);
});
test('navigation has stable numeric order then path order', () => {
  const pages = [
    page({ id: 2, path: '/en/plan-trip/z', metadata: { order: 1 } }),
    page({ id: 3, path: '/en/plan-trip/a', metadata: { order: 1 } }),
    page(),
  ];
  assert.deepEqual(
    buildMenu(pages, 'en')[0].children.map((child) => child.href),
    ['/en/plan-trip/a', '/en/plan-trip/z', '/en/plan-trip/fixture'],
  );
});
test('missing or awaiting-export manifest blocks reads before empty content can deploy', () => {
  const root = directory();
  assert.throws(() => readCatalog(root), /Missing content\/migration/);
  writeFileSync(
    join(root, 'migration.json'),
    JSON.stringify({ version: 1, status: 'awaiting-export' }),
  );
  assert.throws(() => readCatalog(root), /not complete/);
});
test('catalog preserves all article fields and country values and verifies hashes', () => {
  const { catalog, data } = fixtureCatalog();
  verifySnapshot(catalog, validateSnapshot(data));
  assert.equal(catalog.pages[0].format, 'mdx');
  assert.deepEqual(catalog.countries, data.countries);
  assert.equal(catalog.migration.pageCount, data.pages.length);
  assert.equal(catalog.migration.countryCount, data.countries.length);
});
test('editorial changes load normally but differ from initial snapshot checksums', () => {
  const { root, data, catalog } = fixtureCatalog();
  const file = join(root, 'pages/en/plan-trip/fixture.mdx');
  const { content: _content, format: _format, ...fields } = catalog.pages[0];
  writeFileSync(file, serializePage(fields, 'Reviewed editorial change'));
  assert.throws(
    () => verifySnapshot(readCatalog(root), data),
    /differs from the export/,
  );
  assert.equal(readCatalog(root).pages[0].content, 'Reviewed editorial change');
});
test('baseline article deletion or conversion to draft fails', () => {
  const { root, catalog } = fixtureCatalog();
  const file = join(root, 'pages/en/plan-trip/fixture.mdx');
  const { content, format: _format, ...fields } = catalog.pages[0];
  writeFileSync(file, serializePage({ ...fields, draft: true }, content));
  assert.throws(() => readCatalog(root), /Missing published legacy/);
  rmSync(file);
  assert.throws(() => readCatalog(root), /No article files/);
});
test('new drafts are allowed without changing the migration baseline', () => {
  const { root } = fixtureCatalog();
  writeFileSync(
    join(root, 'pages/en/plan-trip/draft.md'),
    serializePage(
      frontmatter({ id: undefined, path: '/en/plan-trip/draft', draft: true }),
      '',
    ),
  );
  const catalog = readCatalog(root);
  assert.equal(catalog.pages.length, 2);
  assert.equal(publishedPages(catalog.pages).length, 1);
});
test('same path with both md and mdx extensions fails', () => {
  const { root } = fixtureCatalog();
  const file = join(root, 'pages/en/plan-trip/fixture.mdx');
  writeFileSync(file.replace(/mdx$/, 'md'), readFileSync(file));
  assert.throws(() => readCatalog(root), /Duplicate content path/);
});
test('catalog rejects symlinked articles without touching the target', () => {
  const { root } = fixtureCatalog();
  const outside = directory();
  writeFileSync(join(outside, 'secret.md'), 'do not read');
  symlinkSync(join(outside, 'secret.md'), join(root, 'pages/secret.md'));
  assert.throws(() => readCatalog(root), /Symlink/);
  assert.equal(readFileSync(join(outside, 'secret.md'), 'utf8'), 'do not read');
});
test('tampered country values fail initial acceptance check', () => {
  const { root, data } = fixtureCatalog();
  writeFileSync(
    join(root, 'countries.json'),
    JSON.stringify([{ ...data.countries[0], policyDetails: 'changed' }]),
  );
  assert.throws(
    () => verifySnapshot(readCatalog(root), validateSnapshot(data)),
    /Countries differ/,
  );
});
test('tampered manifest counts fail initial acceptance check', () => {
  const { root, data } = fixtureCatalog();
  writeFileSync(
    join(root, 'migration.json'),
    JSON.stringify({ ...createManifest(data), countryCount: 3 }),
  );
  assert.throws(
    () => verifySnapshot(readCatalog(root), validateSnapshot(data)),
    /manifest count/,
  );
});
test('catalog rejects case-only paths across Markdown and MDX on every filesystem', () => {
  const { root } = fixtureCatalog();
  // Distinct extensions allow this fixture even on case-insensitive macOS.
  writeFileSync(
    join(root, 'pages/en/plan-trip/Fixture.md'),
    serializePage(
      frontmatter({ id: 2, path: '/en/plan-trip/Fixture' }),
      'Other body',
    ),
  );
  assert.throws(() => readCatalog(root), /Case-colliding/);
});
test('catalog rejects duplicate legacy IDs across different paths', () => {
  const { root } = fixtureCatalog();
  writeFileSync(
    join(root, 'pages/en/plan-trip/other.md'),
    serializePage(frontmatter({ path: '/en/plan-trip/other' }), 'Other body'),
  );
  assert.throws(() => readCatalog(root), /Duplicate legacy page id/);
});
test('repeated catalog reads preserve stored articles, countries and manifest', () => {
  const { root } = fixtureCatalog();
  const files = [
    'pages/en/plan-trip/fixture.mdx',
    'countries.json',
    'migration.json',
  ];
  const before = files.map((file) => readFileSync(join(root, file), 'utf8'));
  assert.deepEqual(readCatalog(root), readCatalog(root));
  assert.deepEqual(
    files.map((file) => readFileSync(join(root, file), 'utf8')),
    before,
  );
});
for (const name of ['countries.json', 'migration.json']) {
  test(`catalog rejects symlinked ${name}`, () => {
    const { root } = fixtureCatalog();
    const outside = join(directory(), name);
    const content = readFileSync(join(root, name), 'utf8');
    writeFileSync(outside, content);
    rmSync(join(root, name));
    symlinkSync(outside, join(root, name));
    assert.throws(() => readCatalog(root), /Symlink/);
    assert.equal(readFileSync(outside, 'utf8'), content);
  });
}
