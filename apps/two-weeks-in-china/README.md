# Two Weeks in China: repository-backed content

Articles, navigation, and the eligibility checker use local Markdown/MDX plus
`content/countries.json`. The app has no Neon, Drizzle, PostgreSQL client or database
environment-variable requirement at build/runtime. The other monorepo apps are
unchanged. Rendering keeps the existing Next.js App Router and MDX components.

## Migration status: blocked until the real export is imported

This change prepares the migration; it does **not** contain a database export.
The committed `content/migration.json` is `awaiting-export`, and a production build
fails explicitly until import succeeds. Do not merge/deploy this state. No source
articles, country policies, or counts have been guessed.

## One-time export and import

Use the **two-weeks-in-china database**, not another application's database. A
read-only database role is preferred. The optional exporter needs `psql` 16+ and
uses verified TLS and one repeatable-read, read-only transaction. It selects only
`public.pages` and `public.countries`; it never modifies or drops rows/tables.

From the monorepo root, install with the pinned pnpm version:

```bash
pnpm install --frozen-lockfile
# Supply CONTENT_DATABASE_URL through your local secret/environment mechanism.
# Do not put the real connection string in a shell command, PR, log, or tracked file.
pnpm --filter two-weeks-in-china content:export /tmp/two-weeks-content-export.json
unset CONTENT_DATABASE_URL
pnpm --filter two-weeks-in-china content:import /tmp/two-weeks-content-export.json
pnpm --filter two-weeks-in-china content:verify-export /tmp/two-weeks-content-export.json
pnpm --filter two-weeks-in-china test:content
pnpm --filter two-weeks-in-china content:check
pnpm --filter two-weeks-in-china type-check
pnpm --filter two-weeks-in-china build
```

The exporter refuses to overwrite an existing export. Choose a fresh output path
for a later snapshot. Credentials never enter child-process arguments or logs.
Do not store raw exports in this repository. Alternatively, provide the same
versioned JSON shape from an authorized database export to `content:import`.

The importer validates all rows, stages the entire content tree, compares counts
and SHA-256 digests of all article fields and countries, then replaces the local
content directory with rollback protection. Existing MDX bodies are byte-for-byte
unchanged. An identical rerun is safe; a different snapshot or edited content is
never overwritten. Unsupported/colliding paths fail explicitly, rather than being
renamed or silently dropped. Resolve such a failure with an explicit URL plan.

`content:verify-export` is an initial cutover check. After reviewed editorial
changes, those initial checksums naturally differ; normal builds validate content
and preserve the original published URL baseline without requiring unchanged text.
Do not falsify the historical manifest to silence errors.

## Publishing and development

```bash
pnpm --filter two-weeks-in-china dev
```

Copy `content/templates/article.md` under `content/pages/`, then follow `AGENTS.md`.
The path `/en/plan-trip/example-guide` maps to
`content/pages/en/plan-trip/example-guide.md`. Drafts do not appear in routes or
navigation. Metadata drives existing menu sections, ordering, icons and subtitles.
Plain `.md` is preferred for generated articles; reviewed `.mdx` can use existing
React components. Both formats support GFM. The server reads local files only,
and Next.js file tracing explicitly includes the content directory for deployment.

## Acceptance and cutover

Confirm real export/import verification, frozen-lockfile installation, content
compilation, type checking, and a production build with DATABASE_URL **unset**.
Smoke-test original English/Chinese URLs, draft 404s, menus, policy filtering and
unknown-country behavior. Compare article/country counts to the source snapshot.
Then review and merge the PR. Remove database environment variables from this
app's deployment configuration after verification. This patch does not delete
remote databases, backups, or secrets and does not change other apps' database use.

Reference: https://nextjs.org/docs/app/guides/mdx
