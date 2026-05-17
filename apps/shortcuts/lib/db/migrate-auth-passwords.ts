import { hashPassword } from 'better-auth/crypto';
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: ['.env'] });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = postgres(connectionString, { max: 1 });

try {
  const users = await sql<{ id: string; password: string }[]>`
    SELECT "id", "password"
    FROM "user"
    WHERE "password" IS NOT NULL
  `;

  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);

    await sql`
      UPDATE "account"
      SET "password" = ${hashedPassword}, "updatedAt" = now()
      WHERE "providerId" = 'credential' AND "accountId" = ${user.id}
    `;
  }

  console.log(`Migrated ${users.length} shortcut password account(s).`);
} finally {
  await sql.end();
}
