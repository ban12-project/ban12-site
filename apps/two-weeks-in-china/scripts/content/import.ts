import { resolve } from 'node:path';
import { importSnapshot, readSnapshot } from './importer';

try {
  const input = process.argv[2];
  if (!input || process.argv.length !== 3) throw new Error('Usage: pnpm content:import /absolute/path/export.json');
  const snapshot = importSnapshot(readSnapshot(resolve(input)), resolve('content'));
  console.log(`Imported and verified ${snapshot.pages.length} articles and ${snapshot.countries.length} countries.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Content import failed');
  process.exitCode = 1;
}
