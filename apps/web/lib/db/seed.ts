import { config } from 'dotenv';
import { desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

import { restaurant } from './schema';

config({ path: ['.env'] });

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const record = await db
    .select()
    .from(restaurant)
    .orderBy(desc(restaurant.created_at))
    .limit(1);

  console.log(record);

  console.log('done');
}

main();
