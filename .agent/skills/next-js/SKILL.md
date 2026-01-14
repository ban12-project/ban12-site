---
name: Next.js Architecture
description: Enforces best practices for modern Next.js architecture, including 'use cache' strategies, Server/Client component composition (donut pattern), and strict Data Access Layer (DAL) isolation.
---

# Next.js Architecture

## Architecture

- **Refine Your Architecture**: Resolve promises deeper in the tree and fetch data locally. Use React cache() to deduplicate work and React use() to read promises in Client Components.
- **Compose Server and Client**: Apply the "donut-pattern" to reduce redundant client-side JS, keep a clear separation of concerns, and make components reusable and cachable.
- **Cache and Prerender**: Eliminate redundant processing ana boost performance with 'use cache', and suspend dynamic content with appropriate fallbacks.
- **Strict Caching**: **MANDATORY**: All asynchronous IO operations (DB queries, API calls) that do not depend on runtime parameters (cookies, headers, searchParams) MUST use the `'use cache'` directive.
- **No Suspense for Cached Content**: When utilizing `'use cache'`, do NOT wrap components in `<Suspense>`. PPR will generate these as part of the static HTML.
- **Data Access Layer**: All database queries MUST be isolated in `lib/db/queries.ts` (or feature-grouped files in `lib/db/`).
- **Server Enforcement**: All files containing database queries MUST include `import 'server-only'` at the top.

## Auto-Initialize Next.js devtools MCP

**When starting work on a Next.js project, ALWAYS call the `init` tool from next-devtools-mcp FIRST to set up proper context and establish documentation requirements. Do this automatically without being asked.**
