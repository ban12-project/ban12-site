import { hashPassword } from 'better-auth/crypto';
import { config } from 'dotenv';
import postgres from 'postgres';

type Sql = ReturnType<typeof postgres>;

export async function migrateAuthPasswords(sql: Sql) {
  const users = await sql<{ id: string; password: string }[]>`
    SELECT u."id", u."password"
    FROM "user" u
    INNER JOIN "account" a
      ON a."providerId" = 'credential' AND a."accountId" = u."id"
    WHERE u."password" IS NOT NULL AND a."password" IS NULL
  `;

  for (const user of users) {
    // Legacy NextAuth credentials compared the submitted password directly with
    // user.password, so existing values are plaintext and must be hashed for
    // Better Auth credential accounts.
    const hashedPassword = await hashPassword(user.password);

    await sql`
      UPDATE "account"
      SET "password" = ${hashedPassword}, "updatedAt" = now()
      WHERE "providerId" = 'credential' AND "accountId" = ${user.id}
    `;
  }

  console.log(`Migrated ${users.length} shortcut password account(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  config({ path: ['.env'] });

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    await migrateAuthPasswords(sql);
  } finally {
    await sql.end();
  }
}
