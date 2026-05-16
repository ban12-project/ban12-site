# Ban12 Site Development Guide

> Note: `CLAUDE.md` points to this file. Keep the root guidance here, and use app/package-local
> `AGENTS.md` files for narrower rules.

## Codebase Structure

This is a pnpm 10 + Turborepo monorepo for the Ban12 web properties.

```text
ban12-site/
├── apps/
│   ├── web/                 # ban12.com Next.js app
│   ├── blog/                # blog.ban12.com Next.js app
│   ├── shortcuts/           # shortcuts.ban12.com Next.js app
│   ├── toys/                # tools/toys Next.js app, includes Rust/WASM builds
│   ├── two-weeks-in-china/  # Next.js app with Drizzle/Postgres
│   └── video-worker/        # Node/TypeScript worker for video processing
├── packages/
│   ├── ui/                  # Shared React components, hooks, and global CSS
│   ├── i18n/                # Shared i18n helpers for Next.js apps
│   ├── biome-config/        # Shared Biome configuration
│   └── typescript-config/   # Shared tsconfig presets
├── crates/                  # Rust crates compiled for WASM consumers
└── .agents/skills/          # Local Codex skills for this repo
```

The workspace packages are declared in `pnpm-workspace.yaml`: `apps/*` and `packages/*`.
Rust crates are managed by the root `Cargo.toml` workspace.

## Before Editing

- Read the nearest relevant `README.md` and any `AGENTS.md` between the repo root and the target file.
- For work inside a Next.js app, follow the local app `AGENTS.md`: read the relevant documentation in
  `node_modules/next/dist/docs/` before changing Next.js code.
- Check existing patterns in the target app/package before adding a new abstraction or dependency.
- Treat current worktree changes as user-owned unless you made them. Do not revert unrelated changes.

## Package Manager and Runtime

- Use `pnpm`, not npm or yarn.
- Node must satisfy `>=20`; pnpm must satisfy `>=10`.
- The repo is pinned to `pnpm@10.28.0` in `package.json`.
- Prefer workspace-aware commands from the repo root:

```bash
pnpm --filter web dev
pnpm --filter blog type-check
pnpm --filter @repo/ui lint
```

## Common Commands

Root-level commands:

```bash
pnpm dev          # turbo dev for all apps/packages with dev tasks
pnpm build        # turbo build
pnpm lint         # turbo lint
pnpm type-check   # turbo type-check
pnpm format       # biome format --write "**/*.{ts,tsx,md}"
pnpm clean        # turbo clean
```

Focused package commands:

```bash
pnpm --filter <workspace-name> dev
pnpm --filter <workspace-name> build
pnpm --filter <workspace-name> lint
pnpm --filter <workspace-name> type-check
```

Examples of workspace names are `web`, `blog`, `shortcuts`, `toys`,
`two-weeks-in-china`, `video-worker`, `@repo/ui`, and `@repo/i18n`.

## App Notes

- `apps/web`: Next.js app with Drizzle/Postgres, auth, Inngest, Redis, Mapbox, Three.js, and Gemini usage.
  Its `build` script runs `tsx lib/db/migrate` before `next build`, so ensure `DATABASE_URL` is available
  before running production builds locally.
- `apps/shortcuts`: Next.js app with Drizzle/Postgres, auth, S3, Redis/KV, Turnstile, and Gemini usage.
- `apps/toys`: Next.js app targeting Cloudflare/OpenNext workflows. Its `build` runs Rust/WASM compilation first:
  `wasm-pack build ../../crates/calculate-hash` and
  `wasm-pack build ../../crates/similar-wasm-wrapper`.
- `apps/blog`: Next.js blog using Markdown/remark/rehype.
- `apps/two-weeks-in-china`: Next.js app with MDX and Drizzle/Postgres.
- `apps/video-worker`: Node/TypeScript worker. Use `pnpm --filter video-worker build` for `tsc`.

## TypeScript, Imports, and Shared Packages

- This repo is TypeScript-first. Keep new application code in TypeScript/TSX unless the local module is already
  plain JavaScript.
- Next.js apps use `#/*` for app-local imports and `@repo/ui/*` for shared UI source imports.
- `packages/ui` exports components, hooks, utilities, and CSS from `src/`. Prefer using existing shared components
  before creating app-specific duplicates.
- `packages/i18n` exports `./client` and `./server`; keep server-only translation loading out of client components.
- Avoid new dependencies unless the existing stack does not already cover the need. If adding one, update the right
  workspace and prefer catalog entries when a dependency is shared across apps.

## Styling and UI

- Shared UI components live in `packages/ui/src/components`; shared hooks live in `packages/ui/src/hooks`.
- Tailwind CSS is used across the apps, with global shared CSS exported by `@repo/ui/globals.css`.
- Use `lucide-react` icons when a standard icon exists.
- Keep UI changes consistent with the target app's existing visual density, layout, and component style.
- After significant frontend changes, run the relevant app and verify the page in a browser at desktop and mobile sizes.

## Formatting and Linting

- Biome is the formatter/linter for JS, TS, JSX, TSX, JSON, JSONC, and Markdown formatting.
- Root Biome settings use 2-space indentation and a 120-column line width.
- Most package `lint` scripts run `biome check --write`, so lint may modify files.
- Rust files under `crates/` are excluded from root Biome. Use Rust tooling for them.

## Database and Migrations

- Drizzle is used in `apps/web`, `apps/shortcuts`, and `apps/two-weeks-in-china`.
- Schema files live under each app's `lib/db/schema.ts` or `lib/db/schema`.
- Migration files live under each app's `lib/db/migrations`.
- Use the app-local scripts for database work:

```bash
pnpm --filter web db:generate
pnpm --filter web db:migrate
pnpm --filter shortcuts db:check
pnpm --filter two-weeks-in-china db:studio
```

- Do not hand-edit generated migration snapshots unless you are deliberately repairing migration metadata and have
  verified the result.

## Rust and WASM

- Rust workspace members are in `crates/*`.
- `apps/toys` depends on the Rust crates through WASM builds.
- Use `cargo fmt` for Rust formatting and `cargo test`/crate-specific checks when changing Rust logic.
- If a Next.js build depends on WASM artifacts, run the app's `build-rust` or `build` script rather than assuming
  artifacts are current.

## Testing and Verification

- CI runs `pnpm lint` and `pnpm type-check` on pushes and pull requests to `main`.
- For narrow TypeScript or UI changes, prefer a focused command first:

```bash
pnpm --filter <workspace-name> lint
pnpm --filter <workspace-name> type-check
```

- For shared package changes, also verify at least one consuming app when practical.
- For broad changes, run root `pnpm lint` and `pnpm type-check`.
- There is no root test script at the time of writing; use package-specific scripts or add targeted verification
  appropriate to the change.

## Environment and Secrets

- Treat all environment variable values as sensitive.
- Never print, commit, or paste real secrets, tokens, cookies, database URLs, S3 credentials, Redis tokens, or API keys.
- Turbo passes selected env vars through per app in `turbo.json`; mirror those names when documenting setup, but use
  placeholder values only.
- If a required local secret is missing, ask the user for the setup path or skip the command with a clear note.
- Never commit `.env*` files containing real credentials.

## Deployment Notes

- Vercel-oriented apps use normal Next.js build/start scripts unless app-specific deployment docs say otherwise.
- `apps/toys` has Cloudflare/OpenNext scripts: `preview`, `deploy`, `upload`, and `cf-typegen`.
- `apps/video-worker` has a Docker workflow in `.github/workflows/docker-video-worker.yml`.
- Before changing deployment behavior, read the relevant workflow under `.github/workflows/`.

## Agent Workflow

- Keep edits scoped to the app/package touched by the request.
- Prefer `rg`/`rg --files` for searching.
- Use existing scripts and local package names instead of inventing one-off commands.
- When a command cannot run because of missing secrets, network access, or platform tools, report that explicitly and
  continue with the best local verification available.
- Summarize changed files and verification results at the end of the task.

<!-- NEXT-AGENTS-MD-START -->[Next.js Docs Index]|root: ./.next-docs|STOP. What you remember about Next.js is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: npx @next/codemod agents-md --output AGENTS.md|01-app:{04-glossary.mdx}|01-app/01-getting-started:{01-installation.mdx,02-project-structure.mdx,03-layouts-and-pages.mdx,04-linking-and-navigating.mdx,05-server-and-client-components.mdx,06-fetching-data.mdx,07-mutating-data.mdx,08-caching.mdx,09-revalidating.mdx,10-error-handling.mdx,11-css.mdx,12-images.mdx,13-fonts.mdx,14-metadata-and-og-images.mdx,15-route-handlers.mdx,16-proxy.mdx,17-deploying.mdx,18-upgrading.mdx}|01-app/02-guides:{ai-agents.mdx,analytics.mdx,authentication.mdx,backend-for-frontend.mdx,caching-without-cache-components.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,data-security.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instant-navigation.mdx,instrumentation.mdx,internationalization.mdx,json-ld.mdx,lazy-loading.mdx,local-development.mdx,mcp.mdx,mdx.mdx,memory-usage.mdx,migrating-to-cache-components.mdx,multi-tenant.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,prefetching.mdx,preserving-ui-state.mdx,production-checklist.mdx,progressive-web-apps.mdx,public-static-pages.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,single-page-applications.mdx,static-exports.mdx,streaming.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx,videos.mdx}|01-app/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|01-app/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|01-app/02-guides/upgrading:{codemods.mdx,version-14.mdx,version-15.mdx,version-16.mdx}|01-app/03-api-reference:{07-edge.mdx,08-turbopack.mdx}|01-app/03-api-reference/01-directives:{use-cache-private.mdx,use-cache-remote.mdx,use-cache.mdx,use-client.mdx,use-server.mdx}|01-app/03-api-reference/02-components:{font.mdx,form.mdx,image.mdx,link.mdx,script.mdx}|01-app/03-api-reference/03-file-conventions/01-metadata:{app-icons.mdx,manifest.mdx,opengraph-image.mdx,robots.mdx,sitemap.mdx}|01-app/03-api-reference/03-file-conventions/02-route-segment-config:{dynamicParams.mdx,instant.mdx,maxDuration.mdx,preferredRegion.mdx,runtime.mdx}|01-app/03-api-reference/03-file-conventions:{default.mdx,dynamic-routes.mdx,error.mdx,forbidden.mdx,instrumentation-client.mdx,instrumentation.mdx,intercepting-routes.mdx,layout.mdx,loading.mdx,mdx-components.mdx,not-found.mdx,page.mdx,parallel-routes.mdx,proxy.mdx,public-folder.mdx,route-groups.mdx,route.mdx,src-folder.mdx,template.mdx,unauthorized.mdx}|01-app/03-api-reference/04-functions:{after.mdx,cacheLife.mdx,cacheTag.mdx,catchError.mdx,connection.mdx,cookies.mdx,draft-mode.mdx,fetch.mdx,forbidden.mdx,generate-image-metadata.mdx,generate-metadata.mdx,generate-sitemaps.mdx,generate-static-params.mdx,generate-viewport.mdx,headers.mdx,image-response.mdx,next-request.mdx,next-response.mdx,not-found.mdx,permanentRedirect.mdx,redirect.mdx,refresh.mdx,revalidatePath.mdx,revalidateTag.mdx,unauthorized.mdx,unstable_cache.mdx,unstable_noStore.mdx,unstable_rethrow.mdx,updateTag.mdx,use-link-status.mdx,use-params.mdx,use-pathname.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,use-selected-layout-segment.mdx,use-selected-layout-segments.mdx,userAgent.mdx}|01-app/03-api-reference/05-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,appDir.mdx,assetPrefix.mdx,authInterrupts.mdx,basePath.mdx,cacheComponents.mdx,cacheHandlers.mdx,cacheLife.mdx,compress.mdx,crossOrigin.mdx,cssChunking.mdx,deploymentId.mdx,devIndicators.mdx,distDir.mdx,env.mdx,expireTime.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,htmlLimitedBots.mdx,httpAgentOptions.mdx,images.mdx,incrementalCacheHandlerPath.mdx,inlineCss.mdx,logging.mdx,mdxRs.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactCompiler.mdx,reactMaxHeadersLength.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,sassOptions.mdx,serverActions.mdx,serverComponentsHmrCache.mdx,serverExternalPackages.mdx,staleTimes.mdx,staticGeneration.mdx,taint.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,turbopackFileSystemCache.mdx,turbopackIgnoreIssue.mdx,typedRoutes.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,viewTransition.mdx,webVitalsAttribution.mdx,webpack.mdx}|01-app/03-api-reference/05-config:{02-typescript.mdx,03-eslint.mdx}|01-app/03-api-reference/06-cli:{create-next-app.mdx,next.mdx}|02-pages/01-getting-started:{01-installation.mdx,02-project-structure.mdx,04-images.mdx,05-fonts.mdx,06-css.mdx,11-deploying.mdx}|02-pages/02-guides:{analytics.mdx,authentication.mdx,babel.mdx,ci-build-caching.mdx,content-security-policy.mdx,css-in-js.mdx,custom-server.mdx,debugging.mdx,draft-mode.mdx,environment-variables.mdx,forms.mdx,incremental-static-regeneration.mdx,instrumentation.mdx,internationalization.mdx,lazy-loading.mdx,mdx.mdx,multi-zones.mdx,open-telemetry.mdx,package-bundling.mdx,post-css.mdx,preview-mode.mdx,production-checklist.mdx,redirecting.mdx,sass.mdx,scripts.mdx,self-hosting.mdx,static-exports.mdx,tailwind-v3-css.mdx,third-party-libraries.mdx}|02-pages/02-guides/migrating:{app-router-migration.mdx,from-create-react-app.mdx,from-vite.mdx}|02-pages/02-guides/testing:{cypress.mdx,jest.mdx,playwright.mdx,vitest.mdx}|02-pages/02-guides/upgrading:{codemods.mdx,version-10.mdx,version-11.mdx,version-12.mdx,version-13.mdx,version-14.mdx,version-9.mdx}|02-pages/03-building-your-application/01-routing:{01-pages-and-layouts.mdx,02-dynamic-routes.mdx,03-linking-and-navigating.mdx,05-custom-app.mdx,06-custom-document.mdx,07-api-routes.mdx,08-custom-error.mdx}|02-pages/03-building-your-application/02-rendering:{01-server-side-rendering.mdx,02-static-site-generation.mdx,04-automatic-static-optimization.mdx,05-client-side-rendering.mdx}|02-pages/03-building-your-application/03-data-fetching:{01-get-static-props.mdx,02-get-static-paths.mdx,03-forms-and-mutations.mdx,03-get-server-side-props.mdx,05-client-side.mdx}|02-pages/03-building-your-application/06-configuring:{12-error-handling.mdx}|02-pages/04-api-reference:{06-edge.mdx,08-turbopack.mdx}|02-pages/04-api-reference/01-components:{font.mdx,form.mdx,head.mdx,image-legacy.mdx,image.mdx,link.mdx,script.mdx}|02-pages/04-api-reference/02-file-conventions:{instrumentation.mdx,proxy.mdx,public-folder.mdx,src-folder.mdx}|02-pages/04-api-reference/03-functions:{get-initial-props.mdx,get-server-side-props.mdx,get-static-paths.mdx,get-static-props.mdx,next-request.mdx,next-response.mdx,use-params.mdx,use-report-web-vitals.mdx,use-router.mdx,use-search-params.mdx,userAgent.mdx}|02-pages/04-api-reference/04-config/01-next-config-js:{adapterPath.mdx,allowedDevOrigins.mdx,assetPrefix.mdx,basePath.mdx,bundlePagesRouterDependencies.mdx,compress.mdx,crossOrigin.mdx,deploymentId.mdx,devIndicators.mdx,distDir.mdx,env.mdx,exportPathMap.mdx,generateBuildId.mdx,generateEtags.mdx,headers.mdx,httpAgentOptions.mdx,images.mdx,logging.mdx,onDemandEntries.mdx,optimizePackageImports.mdx,output.mdx,pageExtensions.mdx,poweredByHeader.mdx,productionBrowserSourceMaps.mdx,proxyClientMaxBodySize.mdx,reactStrictMode.mdx,redirects.mdx,rewrites.mdx,serverExternalPackages.mdx,trailingSlash.mdx,transpilePackages.mdx,turbopack.mdx,typescript.mdx,urlImports.mdx,useLightningcss.mdx,webVitalsAttribution.mdx,webpack.mdx}|02-pages/04-api-reference/04-config:{01-typescript.mdx,02-eslint.mdx}|02-pages/04-api-reference/05-cli:{create-next-app.mdx,next.mdx}|03-architecture:{accessibility.mdx,fast-refresh.mdx,nextjs-compiler.mdx,supported-browsers.mdx}|04-community:{01-contribution-guide.mdx,02-rspack.mdx}<!-- NEXT-AGENTS-MD-END -->
