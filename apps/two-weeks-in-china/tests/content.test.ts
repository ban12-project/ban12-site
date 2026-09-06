import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
import { importSnapshot } from '../scripts/content/importer';

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
function imported() {
  const root = directory();
  const data = snapshot();
  importSnapshot(data, root);
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
test('import preserves all article fields and country values and verifies hashes', () => {
  const { catalog, data } = imported();
  verifySnapshot(catalog, validateSnapshot(data));
  assert.equal(catalog.pages[0].format, 'mdx');
  assert.deepEqual(catalog.countries, data.countries);
  assert.equal(catalog.migration.pageCount, data.pages.length);
  assert.equal(catalog.migration.countryCount, data.countries.length);
});
test('import keeps content docs and templates intact', () => {
  const root = directory();
  writeFileSync(join(root, 'README.md'), 'retained');
  mkdirSync(join(root, 'templates'));
  writeFileSync(join(root, 'templates/article.md'), 'retained template');
  importSnapshot(snapshot(), root);
  assert.equal(readFileSync(join(root, 'README.md'), 'utf8'), 'retained');
  assert.equal(
    readFileSync(join(root, 'templates/article.md'), 'utf8'),
    'retained template',
  );
});
test('identical reimport is idempotent and a changed snapshot is refused', () => {
  const { root, data } = imported();
  importSnapshot(data, root);
  const changed = structuredClone(data);
  changed.pages[0].content += 'changed';
  assert.throws(() => importSnapshot(changed, root), /does not match/);
  verifySnapshot(readCatalog(root), validateSnapshot(data));
});
test('edited article is preserved and reimport refuses to overwrite it', () => {
  const { root, data, catalog } = imported();
  const file = join(root, 'pages/en/plan-trip/fixture.mdx');
  const { content: _content, format: _format, ...fields } = catalog.pages[0];
  writeFileSync(file, serializePage(fields, 'Reviewed editorial change'));
  assert.throws(() => importSnapshot(data, root), /differs from the export/);
  assert.equal(readCatalog(root).pages[0].content, 'Reviewed editorial change');
});
test('baseline article deletion or conversion to draft fails', () => {
  const { root, catalog } = imported();
  const file = join(root, 'pages/en/plan-trip/fixture.mdx');
  const { content, format: _format, ...fields } = catalog.pages[0];
  writeFileSync(file, serializePage({ ...fields, draft: true }, content));
  assert.throws(() => readCatalog(root), /Missing published legacy/);
  rmSync(file);
  assert.throws(() => readCatalog(root), /No article files/);
});
test('new drafts are allowed without changing the migration baseline', () => {
  const { root } = imported();
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
  const { root } = imported();
  const file = join(root, 'pages/en/plan-trip/fixture.mdx');
  writeFileSync(file.replace(/mdx$/, 'md'), readFileSync(file));
  assert.throws(() => readCatalog(root), /Duplicate content path/);
});
test('case-only path collision fails without installing staged data', () => {
  const root = directory();
  writeFileSync(join(root, 'README.md'), 'untouched');
  const data = snapshot();
  data.pages.push({ ...data.pages[0], id: 2, path: '/en/plan-trip/Fixture' });
  assert.throws(() => importSnapshot(data, root), /Case-colliding/);
  assert.deepEqual(readdirSync(root), ['README.md']);
});
test('invalid import does not partially write pages or a completion manifest', () => {
  const root = directory();
  const data = snapshot();
  data.pages[0].path = '/en/../escape';
  assert.throws(() => importSnapshot(data, root), /Unsafe/);
  assert.equal(existsSync(join(root, 'migration.json')), false);
  assert.deepEqual(readdirSync(root), []);
});
test('symlinked files cannot be read or overwritten during import', () => {
  const { root, data } = imported();
  const outside = directory();
  writeFileSync(join(outside, 'secret.md'), 'do not read');
  symlinkSync(join(outside, 'secret.md'), join(root, 'pages/secret.md'));
  assert.throws(() => readCatalog(root), /Symlink/);
  assert.throws(() => importSnapshot(data, root), /symlinked/);
  assert.equal(readFileSync(join(outside, 'secret.md'), 'utf8'), 'do not read');
});
test('tampered country values fail initial acceptance check', () => {
  const { root, data } = imported();
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
  const { root, data } = imported();
  writeFileSync(
    join(root, 'migration.json'),
    JSON.stringify({ ...createManifest(data), countryCount: 3 }),
  );
  assert.throws(
    () => verifySnapshot(readCatalog(root), validateSnapshot(data)),
    /manifest count/,
  );
});

function mockExport() {
  const root = directory();
  const data = snapshot();
  const capture = join(root, 'capture.json');
  const fake = join(root, 'psql');
  writeFileSync(
    fake,
    `#!${process.execPath}
const fs = require('node:fs');
` +
      `fs.writeFileSync(${JSON.stringify(capture)}, JSON.stringify({argv: process.argv.slice(2), env: process.env, sql: fs.readFileSync(0, 'utf8')}));
` +
      `process.stdout.write(${JSON.stringify(JSON.stringify(data))});
`,
    { mode: 0o700 },
  );
  const output = join(root, 'export.json');
  const env: NodeJS.ProcessEnv = {
    NODE_ENV: 'test',
    PATH: root,
    CONTENT_DATABASE_URL:
      'postgresql://fixture:synthetic-password@db.example.invalid/fixture',
    PGSERVICE: 'wrong-database',
    PGHOSTADDR: '192.0.2.1',
    DATABASE_URL: 'unrelated-placeholder',
  };
  const run = () =>
    spawnSync(
      process.execPath,
      [join(__dirname, '../scripts/content/export.js'), output],
      { env, encoding: 'utf8' },
    );
  return { root, data, capture, fake, output, env, run };
}
test('exporter uses read-only SQL, verified TLS, UTF-8 and no credentials in arguments', () => {
  const setup = mockExport();
  const result = setup.run();
  assert.equal(result.status, 0, result.stderr);
  const captured = JSON.parse(readFileSync(setup.capture, 'utf8'));
  assert.match(captured.sql, /REPEATABLE READ READ ONLY/);
  assert.match(captured.sql, /FROM public.pages/);
  assert.match(captured.sql, /FROM public.countries/);
  assert.equal(captured.env.PGSSLMODE, 'verify-full');
  assert.equal(captured.env.PGCLIENTENCODING, 'UTF8');
  assert.equal(captured.env.PGSERVICE, undefined);
  assert.equal(captured.env.PGHOSTADDR, undefined);
  assert.equal(captured.env.DATABASE_URL, undefined);
  assert.equal(captured.env.CONTENT_DATABASE_URL, undefined);
  assert.equal(captured.argv.join(' ').includes('synthetic-password'), false);
  assert.equal(
    (result.stdout + result.stderr).includes('synthetic-password'),
    false,
  );
  assert.deepEqual(
    JSON.parse(readFileSync(setup.output, 'utf8')),
    validateSnapshot(setup.data),
  );
});
test('exporter refuses to overwrite an existing snapshot', () => {
  const setup = mockExport();
  writeFileSync(setup.output, 'previous backup');
  const result = setup.run();
  assert.notEqual(result.status, 0);
  assert.equal(readFileSync(setup.output, 'utf8'), 'previous backup');
});
test('exporter redacts psql failure details and writes no partial export', () => {
  const setup = mockExport();
  writeFileSync(
    setup.fake,
    `#!${process.execPath}\nprocess.stderr.write('synthetic-password'); process.exit(2);\n`,
  );
  const result = setup.run();
  assert.notEqual(result.status, 0);
  assert.equal(
    (result.stdout + result.stderr).includes('synthetic-password'),
    false,
  );
  assert.equal(existsSync(setup.output), false);
});
test('exporter with no credential fails before invoking psql', () => {
  const setup = mockExport();
  const result = spawnSync(
    process.execPath,
    [join(__dirname, '../scripts/content/export.js'), setup.output],
    { env: { NODE_ENV: 'test', PATH: setup.root }, encoding: 'utf8' },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CONTENT_DATABASE_URL is required/);
  assert.equal(existsSync(setup.capture), false);
  assert.equal(existsSync(setup.output), false);
});
