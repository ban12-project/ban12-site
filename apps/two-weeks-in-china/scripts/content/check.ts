import { resolve } from 'node:path';
import { readCatalog } from '../../lib/content/core';

async function main() {
  const catalog = readCatalog(resolve('content'));
  const [{ serialize }, { default: remarkGfm }] = await Promise.all([
    import('next-mdx-remote-client/serialize'),
    import('remark-gfm'),
  ]);
  for (const page of catalog.pages) {
    // Compile only, never evaluate MDX while validating agent submissions.
    const result = await serialize({
      source: page.content,
      options: {
        mdxOptions: { format: page.format, remarkPlugins: [remarkGfm] },
      },
    });
    if ('error' in result && result.error)
      throw new Error(`${page.path}: ${result.error.message}`);
  }
  console.log(
    `Validated ${catalog.pages.length} article files and ${catalog.countries.length} country records.`,
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Content validation failed',
  );
  process.exitCode = 1;
});
