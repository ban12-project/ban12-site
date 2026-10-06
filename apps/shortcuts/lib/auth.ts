import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { passkey } from '@better-auth/passkey';
import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { headers } from 'next/headers';

import { db } from './db/queries';
import { authSchema } from './db/schema';

export const auth = betterAuth({
  appName: 'Ban12 Shortcuts',
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_HOST_URL,
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: authSchema,
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 6,
  },
  plugins: [
    passkey({
      rpName: 'Ban12 Shortcuts',
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
