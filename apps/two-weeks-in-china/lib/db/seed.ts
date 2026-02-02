import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { countries } from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle({ client: sql });

async function main() {
  const result = await db.select().from(countries);
  console.log(result);

  console.log('done');
}

main();
