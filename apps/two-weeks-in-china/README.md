# Two Weeks in China: repository-backed content

Articles, navigation, and the eligibility checker use local Markdown/MDX plus
`content/countries.json`. The app has no Neon, Drizzle, PostgreSQL client or database
environment-variable requirement at build/runtime. Other monorepo apps are unchanged.
Rendering keeps the existing Next.js App Router and MDX components.

## Imported content and provenance

The repository now contains the imported articles and country records. The initial
`content/migration.json` records 48 articles and 67 countries. This is the historical
migration baseline, not a counter that agents should update after every new article.

The one-time export/import commands and their PostgreSQL tooling have been retired.
Do not restore an importer or a database dependency just to create test fixtures.
Tests create synthetic Markdown/JSON directly in temporary directories and never
read production content or connect to a database. Historical migration tools remain
available in Git history when an explicitly reviewed recovery is necessary.

Keep `content/migration.json`: the content loader still uses it to validate provenance
and ensure original published URLs do not silently disappear. Normal editorial changes
may update article text without matching the original hashes. Do not rewrite historical
checksums to hide data loss. Deliberate URL removal needs a reviewed redirect/migration.

## Development and verification

From the monorepo root, use the pinned pnpm version:

```bash
pnpm install --frozen-lockfile
pnpm --filter two-weeks-in-china test:content
pnpm --filter two-weeks-in-china content:check
pnpm --filter two-weeks-in-china lint
pnpm --filter two-weeks-in-china type-check
env -u DATABASE_URL -u CONTENT_DATABASE_URL pnpm --filter two-weeks-in-china build
pnpm --filter two-weeks-in-china dev
```

`content:compile` first removes only the generated `.content-tools/` directory, then
compiles the current tools and tests. This prevents deleted migration test outputs
from being executed by the test glob. Do not run commands that recompile that directory
concurrently in the same checkout. CI seeds an obsolete compiled test before running
the suite on Linux and macOS to verify this cleanup behavior.

`content:check` validates the real local catalog and compiles every Markdown/MDX file
without evaluating MDX expressions. `build` runs this check before `next build`.
CI also checks application types on both platforms and performs the production build
with database connection variables unset. A test pass alone is not deployment acceptance.

## Publishing

Copy `content/templates/article.md` under `content/pages/`, then follow `AGENTS.md`.
The path `/en/plan-trip/example-guide` maps to
`content/pages/en/plan-trip/example-guide.md`. Drafts do not appear in routes or
navigation. Metadata drives existing menu sections, ordering, icons and subtitles.
Plain `.md` is preferred for generated articles; reviewed `.mdx` can use existing
React components. Both formats support GFM. The server reads local files only,
and Next.js file tracing includes the content directory for deployment.

Smoke-test English/Chinese URLs, draft 404s, menus, policy filtering, and unknown-country
behavior in the preview. Review and merge the content PR; redeploying publishes it.

## Cleanup and deployment

`.content-tools/` is disposable and regenerates automatically. Keep `content/pages/`,
`content/countries.json`, `content/migration.json`, `lib/content/`,
`scripts/content/check.ts`, `tsconfig.content-tools.json`, and the content tests.
Keep raw database exports and backups outside this repository; do not publish secrets.

After verifying the deployed app, remove only this app's unused database environment
variables. Do not delete databases, backups, or credentials used by `web`, `shortcuts`,
or a still-running older deployment as part of this cleanup.

Reference: https://nextjs.org/docs/app/guides/mdx
