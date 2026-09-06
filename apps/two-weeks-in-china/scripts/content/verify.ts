import { resolve } from 'node:path';
import { readCatalog, verifySnapshot } from '../../lib/content/core';
import { readSnapshot } from './importer';

try {
  const input = process.argv[2];
  if (!input || process.argv.length !== 3) throw new Error('Usage: pnpm content:verify-export /absolute/path/export.json');
  verifySnapshot(readCatalog(resolve('content')), readSnapshot(resolve(input)));
  console.log('Original article paths, content, metadata, dates, IDs, and country records match the export.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Export verification failed');
  process.exitCode = 1;
}
