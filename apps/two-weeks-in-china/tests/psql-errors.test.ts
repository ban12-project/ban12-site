import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { describePsqlFailure } from '../scripts/content/psql-errors';

const cases: [string, string][] = [
  ['root certificate file "system" does not exist', 'PSQL_CLIENT_VERSION'],
  ['SSL error: certificate verify failed', 'PSQL_TLS_ERROR'],
  ['could not translate host name "private-host" to address', 'PSQL_DNS_ERROR'],
  ['FATAL: password authentication failed for user "private-user"', 'PSQL_AUTH_ERROR'],
  ['fe_sendauth: no password supplied', 'PSQL_AUTH_ERROR'],
  ['FATAL: database "private-database" does not exist', 'PSQL_DATABASE_NOT_FOUND'],
  ['ERROR: relation "public.pages" does not exist', 'PSQL_SCHEMA_MISMATCH'],
  ['ERROR: column "private-column" does not exist', 'PSQL_SCHEMA_MISMATCH'],
  ['FATAL: unsupported startup parameter: options', 'PSQL_STARTUP_OPTIONS'],
  ['ERROR: permission denied for table countries', 'PSQL_ACCESS_DENIED'],
  ['ERROR: canceling statement due to statement timeout', 'PSQL_QUERY_TIMEOUT'],
  ['connection to server at "private-host" failed: Connection refused', 'PSQL_CONNECTION_ERROR'],
  ['timeout expired', 'PSQL_CONNECTION_ERROR'],
  ['dyld: Library not loaded: private-library', 'PSQL_CLIENT_BROKEN'],
];

for (const [stderr, expected] of cases) {
  test(`export diagnostic classifies ${expected} without leaking stderr`, () => {
    const message = describePsqlFailure({
      status: 2,
      signal: null,
      stderr: `${stderr}\npostgresql://private-user:secret-password@private-host/private-database\nprivate SQL body`,
    });
    assert.ok(message.startsWith(`[${expected}]`), message);
    for (const sensitive of [
      'secret-password',
      'private-user',
      'private-host',
      'private-database',
      'private SQL body',
    ])
      assert.equal(message.includes(sensitive), false);
  });
}

for (const [code, expected] of [
  ['ENOENT', 'PSQL_NOT_FOUND'],
  ['EACCES', 'PSQL_NOT_EXECUTABLE'],
  ['ETIMEDOUT', 'PSQL_TIMEOUT'],
  ['ENOBUFS', 'PSQL_OUTPUT_LIMIT'],
  ['UNKNOWN', 'PSQL_PROCESS_ERROR'],
]) {
  test(`export diagnostic classifies process error ${code}`, () => {
    const error = Object.assign(new Error('secret-password'), { code });
    const message = describePsqlFailure({
      error,
      status: null,
      signal: null,
      stderr: '',
    });
    assert.ok(message.startsWith(`[${expected}]`), message);
    assert.equal(message.includes('secret-password'), false);
  });
}

test('interrupted and unknown failures never expose raw error text', () => {
  assert.match(
    describePsqlFailure({ status: null, signal: 'SIGTERM', stderr: '' }),
    /PSQL_INTERRUPTED/,
  );
  assert.match(
    describePsqlFailure({ status: 3, signal: null, stderr: 'private SQL' }),
    /PSQL_QUERY_FAILED/,
  );
  const message = describePsqlFailure({
    status: 2,
    signal: null,
    stderr: 'secret-password',
  });
  assert.match(message, /PSQL_FAILED/);
  assert.equal(message.includes('secret-password'), false);
});

test('CLI distinguishes missing psql from a missing environment variable', () => {
  const root = mkdtempSync(join(tmpdir(), 'two-weeks-psql-'));
  try {
    const output = join(root, 'export.json');
    const result = spawnSync(
      process.execPath,
      [join(__dirname, '../scripts/content/export.js'), output],
      {
        env: {
          NODE_ENV: 'test',
          PATH: root,
          CONTENT_DATABASE_URL:
            'postgresql://fixture:secret-password@db.example.invalid/fixture',
        },
        encoding: 'utf8',
        timeout: 10_000,
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /PSQL_NOT_FOUND/);
    assert.equal(result.stderr.includes('secret-password'), false);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('CLI reports safe diagnostics and never prompts for a password or writes a failed export', () => {
  const root = mkdtempSync(join(tmpdir(), 'two-weeks-psql-'));
  try {
    writeFileSync(
      join(root, 'psql'),
      `#!${process.execPath}
if (!process.argv.includes('--no-password')) process.exit(10);
if (process.env.LC_ALL !== 'C') process.exit(11);
if (process.env.PGSSLMODE !== 'verify-full') process.exit(12);
process.stderr.write('FATAL: password authentication failed: secret-password');
process.exit(2);
`,
      { mode: 0o700 },
    );
    const output = join(root, 'export.json');
    const result = spawnSync(
      process.execPath,
      [join(__dirname, '../scripts/content/export.js'), output],
      {
        env: {
          NODE_ENV: 'test',
          PATH: root,
          LC_ALL: 'zh_CN.UTF-8',
          CONTENT_DATABASE_URL:
            'postgresql://fixture:secret-password@db.example.invalid/fixture',
        },
        encoding: 'utf8',
        timeout: 10_000,
      },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /PSQL_AUTH_ERROR/);
    assert.equal(result.stderr.includes('secret-password'), false);
    assert.equal(existsSync(output), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
