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

## Content editor agent

Use the repository [china-content-editor skill](../../../.agents/skills/china-content-editor/SKILL.md)
for research, plain-language writing, illustrations, translation, and issue/PR delivery.
Its [format reference](../../../.agents/skills/china-content-editor/references/markdown.md)
documents the actual Markdown/GFM/MDX support and its limits.

Copy [source-ledger.md](templates/source-ledger.md) into
`content/reviews/<issue>-<topic>.md` for each editorial task. The ledger records
claim-level official evidence and image permissions; readers also need inline
citations and visible verification dates in the article. These records are editorial
review requirements, not automatically enforced fact checks. Templates and reviews
are outside `pages/` and are not routed. New articles remain drafts pending review.

Start with the **Two Weeks 内容更新** GitHub issue template. Validate locally and
batch the final push before opening the linked PR. Existing integrations may build
that push/PR; a draft PR does not guarantee that Vercel skips a build.
