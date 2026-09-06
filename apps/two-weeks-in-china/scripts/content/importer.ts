import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import {
  createManifest,
  readCatalog,
  serializePage,
  validateSnapshot,
  verifySnapshot,
} from '../../lib/content/core';
import type { ContentSnapshot } from '../../lib/content/types';

function hasSymlinks(directory: string): boolean {
  const stat = lstatSync(directory);
  return (
    stat.isSymbolicLink() ||
    (stat.isDirectory() &&
      readdirSync(directory).some((name) => hasSymlinks(join(directory, name))))
  );
}

/** No database access. Fully validate in a sibling directory before replacing it. */
export function importSnapshot(
  value: unknown,
  destination: string,
): ContentSnapshot {
  const snapshot = validateSnapshot(value);
  const target = resolve(destination);
  const parent = dirname(target);
  mkdirSync(parent, { recursive: true });
  if (existsSync(target)) {
    if (hasSymlinks(target))
      throw new Error('Refusing to replace a symlinked content tree');
    const pages = join(target, 'pages');
    const countries = join(target, 'countries.json');
    if (
      existsSync(countries) ||
      (existsSync(pages) && readdirSync(pages).length > 0)
    ) {
      // Only an identical re-run is allowed. No --force: never overwrite articles
      // edited by an agent or a later country-policy correction.
      verifySnapshot(readCatalog(target), snapshot);
      return snapshot;
    }
  }
  const work = mkdtempSync(join(parent, '.content-import-'));
  const staging = join(work, 'staging');
  const backup = join(work, 'previous');
  let movedPrevious = false;
  let installed = false;
  try {
    if (existsSync(target)) cpSync(target, staging, { recursive: true });
    else mkdirSync(staging);
    for (const page of snapshot.pages) {
      const { content, ...frontmatter } = page;
      // Existing database content is MDX. Keep it byte-for-byte, including JSX.
      const file = join(staging, 'pages', `${page.path.slice(1)}.mdx`);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(
        file,
        serializePage({ ...frontmatter, draft: false }, content),
        { flag: 'wx' },
      );
    }
    writeFileSync(
      join(staging, 'countries.json'),
      `${JSON.stringify(snapshot.countries, null, 2)}\n`,
    );
    writeFileSync(
      join(staging, 'migration.json'),
      `${JSON.stringify(createManifest(snapshot), null, 2)}\n`,
    );
    verifySnapshot(readCatalog(staging), snapshot);
    if (existsSync(target)) {
      renameSync(target, backup);
      movedPrevious = true;
    }
    try {
      renameSync(staging, target);
      installed = true;
    } catch (error) {
      if (movedPrevious) {
        renameSync(backup, target);
        movedPrevious = false;
      }
      throw error;
    }
  } finally {
    // If rollback itself failed, keep the backup and report its path rather than
    // deleting the only remaining copy.
    if (movedPrevious && !installed) {
      console.error(
        `Import rollback needs attention; preserved backup: ${backup}`,
      );
    } else rmSync(work, { recursive: true, force: true });
  }
  return snapshot;
}

export function readSnapshot(file: string): ContentSnapshot {
  return validateSnapshot(JSON.parse(readFileSync(file, 'utf8')));
}
