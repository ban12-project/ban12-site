import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';

import { db } from '#/lib/db/queries';
import { authSchema } from '#/lib/db/schema';

export const auth = betterAuth({
  appName: 'Ban12',
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_HOST_URL,
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
    camelCase: true,
  }),
  plugins: [
    passkey({
      rpName: 'Ban12',
    }),
    nextCookies(),
  ],
});

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function signOut() {
  return auth.api.signOut({
    headers: await headers(),
  });
}
