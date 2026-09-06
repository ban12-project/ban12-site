/** One-time read-only export. Not imported by the app, dev server or build. */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateSnapshot } from '../../lib/content/core';

const QUERY = `
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT json_build_object(
  'version', 1,
  'exportedAt', to_char(CURRENT_TIMESTAMP AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
  'pages', COALESCE((SELECT json_agg(json_build_object(
    'id', id, 'path', path, 'title', title, 'subtitle', subtitle,
    'content', content, 'metadata', metadata, 'createdAt', created_at, 'updatedAt', updated_at
  ) ORDER BY path) FROM public.pages), '[]'::json),
  'countries', COALESCE((SELECT json_agg(json_build_object(
    'id', id, 'name', name, 'code', code, 'visaPolicy', visa_policy,
    'policyDetails', policy_details, 'createdAt', created_at, 'updatedAt', updated_at
  ) ORDER BY name) FROM public.countries), '[]'::json)
);
COMMIT;
`;

try {
  const output = process.argv[2];
  if (!output || process.argv.length !== 3)
    throw new Error(
      'Usage: pnpm content:export /absolute/path/outside-repo.json',
    );
  const connection = process.env.CONTENT_DATABASE_URL;
  if (!connection)
    throw new Error(
      'CONTENT_DATABASE_URL is required only for this one-time export.',
    );
  let url: URL;
  try {
    url = new URL(connection);
  } catch {
    throw new Error('Invalid CONTENT_DATABASE_URL');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol))
    throw new Error('Expected a PostgreSQL connection URL');
  if (!url.hostname || !url.pathname.slice(1))
    throw new Error('The database URL must include a host and database name');
  // Pass credentials in the child environment, never in argv, logs or files.
  // SSL certificate/hostname verification is required for the Neon endpoint.
  // Ignore inherited libpq service/host overrides to avoid exporting the wrong
  // application's database. UTF-8 keeps text encoding deterministic.
  const inherited = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !key.startsWith('PG') &&
        key !== 'CONTENT_DATABASE_URL' &&
        key !== 'DATABASE_URL',
    ),
  );
  const env: NodeJS.ProcessEnv = {
    ...inherited,
    NODE_ENV: process.env.NODE_ENV ?? 'production',
    PGHOST: url.hostname,
    PGPORT: url.port || '5432',
    PGDATABASE: decodeURIComponent(url.pathname.slice(1)),
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGSSLMODE: 'verify-full',
    PGSSLROOTCERT: 'system',
    PGCLIENTENCODING: 'UTF8',
    PGCONNECT_TIMEOUT: '20',
    PGAPPNAME: 'two-weeks-content-export',
    PGOPTIONS:
      '-c default_transaction_read_only=on -c statement_timeout=120000',
  };
  const result = spawnSync(
    'psql',
    [
      '--no-psqlrc',
      '--quiet',
      '--tuples-only',
      '--no-align',
      '--set=ON_ERROR_STOP=1',
    ],
    {
      env,
      input: QUERY,
      encoding: 'utf8',
      timeout: 150_000,
      maxBuffer: 128 * 1024 * 1024,
    },
  );
  if (result.error || result.status !== 0) {
    // psql stderr can include connection information. Do not echo it.
    throw new Error(
      'Read-only export failed. Check psql 16+, connectivity and CONTENT_DATABASE_URL; no content was written.',
    );
  }
  const snapshot = validateSnapshot(JSON.parse(result.stdout.trim()));
  writeFileSync(resolve(output), `${JSON.stringify(snapshot, null, 2)}\n`, {
    flag: 'wx',
    mode: 0o600,
  });
  console.log(
    `Exported ${snapshot.pages.length} articles and ${snapshot.countries.length} countries. No database rows were modified.`,
  );
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Content export failed',
  );
  process.exitCode = 1;
}
