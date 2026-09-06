import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import {
  readCatalog,
  validateSnapshot,
  verifySnapshot,
} from '../lib/content/core';
import type { ContentSnapshot } from '../lib/content/types';
import { importSnapshot } from '../scripts/content/importer';

// Synthetic data only; these tests never read a database or production content.
const directories: string[] = [];
function directory(): string {
  const root = mkdtempSync(join(tmpdir(), 'two-weeks-import-paths-'));
  directories.push(root);
  return root;
}
afterEach(() => {
  for (const root of directories.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function snapshot(paths: string[]): ContentSnapshot {
  return {
    version: 1,
    exportedAt: '2026-09-06T01:00:00Z',
    pages: paths.map((path, index) => ({
      id: index + 1,
      path,
      title: 'Synthetic path fixture',
      subtitle: null,
      metadata: null,
      createdAt: '2025-01-01T12:00:00',
      updatedAt: '2025-01-02T12:00:00',
      content: '\nSynthetic **content**\r\n',
    })),
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

const collisions = [
  ['/en/plan-trip/fixture', '/en/plan-trip/Fixture'],
  ['/en/plan-trip/fixture', '/en/Plan-Trip/fixture'],
  ['/en/plan-trip/first', '/en/Plan-Trip/second'],
  ['/en/plan-trip/Guides/first', '/en/plan-trip/guides/second'],
];
for (const paths of collisions) {
  for (const reversed of [false, true]) {
    const label = `${paths.join(' vs ')} (reversed=${reversed})`;
    test(`preflight rejects ${label} before mkdir`, () => {
      const root = directory();
      const parent = join(root, 'not-created');
      const data = snapshot(reversed ? [...paths].reverse() : paths);
      assert.throws(
        () => importSnapshot(data, join(parent, 'content')),
        /Case-colliding content paths:/,
      );
      // Testing preflight on any filesystem also catches late validation on Linux.
      assert.equal(existsSync(parent), false);
      assert.deepEqual(readdirSync(root), []);
    });
  }
}

test('case conflict diagnosis precedes even an unusable destination', () => {
  const root = directory();
  const blocked = join(root, 'not-a-directory');
  writeFileSync(blocked, 'untouched');
  assert.throws(
    () => importSnapshot(snapshot(collisions[0]), join(blocked, 'content')),
    /Case-colliding content paths:/,
  );
  assert.equal(readFileSync(blocked, 'utf8'), 'untouched');
  assert.deepEqual(readdirSync(root), ['not-a-directory']);
});

test('case conflict leaves existing content and staging parent untouched', () => {
  const root = directory();
  const target = join(root, 'content');
  mkdirSync(target);
  writeFileSync(join(target, 'README.md'), 'retained');
  assert.throws(
    () => importSnapshot(snapshot(collisions[0]), target),
    /Case-colliding content paths:/,
  );
  assert.equal(readFileSync(join(target, 'README.md'), 'utf8'), 'retained');
  assert.deepEqual(readdirSync(target), ['README.md']);
  assert.deepEqual(readdirSync(root), ['content']);
});

test('noncolliding paths preserve case, content and reimport', () => {
  const target = join(directory(), 'content');
  const data = snapshot([
    '/en/Plan-Trip/First',
    '/en/Plan-Trip/Second',
    '/en/Plan-Trip/First/Child',
    '/zh/Plan-Trip/First',
  ]);
  const original = structuredClone(data);
  importSnapshot(data, target);
  const catalog = readCatalog(target);
  verifySnapshot(catalog, validateSnapshot(data));
  assert.deepEqual(data, original);
  for (const page of data.pages) {
    assert.equal(
      existsSync(join(target, 'pages', `${page.path.slice(1)}.mdx`)),
      true,
    );
    assert.equal(
      catalog.pages.find((stored) => stored.path === page.path)?.content,
      page.content,
    );
  }
  // A second identical import must still work with preserved case and checksums.
  importSnapshot(data, target);
  verifySnapshot(readCatalog(target), validateSnapshot(data));
});
