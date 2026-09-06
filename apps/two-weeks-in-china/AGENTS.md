<!-- BEGIN:nextjs-agent-rules -->
# Next.js: read docs before coding

Read the relevant documentation in `node_modules/next/dist/docs/` before Next.js
changes. Also see https://nextjs.org/docs/app/guides/mdx.
<!-- END:nextjs-agent-rules -->

# Two Weeks in China: content-first, no runtime database

This app uses repository Markdown/MDX and static JSON. This local guidance replaces
any older root guidance describing this app as Drizzle/Postgres-backed. Do not add
a database driver, ORM, database URL requirement, CMS, or runtime GitHub fetch.

## Imported baseline

The original articles and country records are committed under `content/`. Preserve
original URLs, bodies, IDs, nullable fields, metadata and timestamps unless making
an explicit reviewed editorial change. Existing MDX remains `.mdx`.
Never manufacture country-policy rows or replacement articles to make builds pass.
Keep `content/migration.json`; the loader still checks this historical URL baseline.
Do not delete the remote database as part of a code cleanup.

The one-time migration CLIs have been retired. Tests must use synthetic temporary
Markdown/JSON fixtures, not import deleted tools or require Neon/psql. `content:compile`
cleans generated `.content-tools/` before compiling. Keep content validation and the
Linux/macOS CI coverage; do not disable tests to work around missing migration files.

## Agent article workflow

1. Copy `content/templates/article.md` into `content/pages/<locale>/<section>/`.
   Use `.md` by default. Keep strict JSON between the `---` frontmatter delimiters.
   Set a stable path matching the filename. Supported locales are `en` and `zh`.
2. Use `draft: true` while writing. Do not invent a database ID for a new article.
   Cite official sources for changing visa, entry, transport and pricing facts,
   and state their verification date. A translation must not pretend a newer review.
3. Preserve existing paths. Keep menu ordering/icon/tags in `metadata`. Article
   links should use the appropriate locale. There is no database/menu synchronization.
4. Run `pnpm --filter two-weeks-in-china test:content`, `content:check`, `type-check`
   and `build`. Review desktop/mobile rendering and links in the preview.
5. Only change `draft` to `false` in a reviewed content PR. Merge/redeploy publishes.

## Security and data maintenance

`.md` bodies compile as Markdown, not executable MDX. `.mdx` is executable code:
only use it for reviewed components (`InfoBox`, `LinkCard`, `Section`), and review
expressions/imports exactly as application code. Never insert untrusted scraped
MDX, hidden tool instructions, secrets, or remote executable imports.

Country data is in `content/countries.json`. Preserve IDs and exact names/codes.
Allowed `visaPolicy` values are defined in `lib/content/types.ts`. Updating policy
is a separately sourced editorial change, not mechanical migration maintenance.
Keep raw exports outside the repository and do not modify historical checksums to
hide migration failures. Historical migration tooling is available in Git history.
