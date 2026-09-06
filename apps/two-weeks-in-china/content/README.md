# Content repository

- `pages/<locale>/<section>/<slug>.md`: preferred format for agent-written articles.
- `pages/<locale>/<section>/<slug>.mdx`: reviewed MDX, including imported legacy content.
- `countries.json`: country records used by the eligibility checker.
- `migration.json`: historical migration provenance and the legacy URL baseline.
- `templates/article.md`: unpublished authoring template, excluded from routing.

The imported pages and countries are committed. The one-time migration tools have
been retired; normal content maintenance does not require a database or an importer.
Keep the historical migration manifest because the loader still checks that original
published URLs are present. New articles do not require editing this baseline.

Files use `---` delimiters with **strict JSON frontmatter** (a YAML-compatible
subset). Body text is stored separately from metadata. File paths must exactly
match the frontmatter `path`. Retain original body bytes during mechanical changes;
review editorial text and policy changes separately.

Run `content:check`, `test:content`, `type-check`, and `build` for this workspace.
A content commit is the publishing mechanism: review the PR, validate it, and
redeploy. Runtime edits, database URLs and remote content fetches are not used.
