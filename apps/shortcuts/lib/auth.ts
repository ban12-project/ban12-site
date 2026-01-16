import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth, { type Session, type User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Passkey from 'next-auth/providers/passkey';
import * as z from 'zod';

import { authConfig } from './auth.config';
import { db, getUser } from './db/queries';

interface ExtendedSession extends Session {
  user: User;
}

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          // TODO: Implement salt and hash password
          const passwordsMatch = password === user.password;

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
    Passkey,
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    session({ session, token }: { session: ExtendedSession; token: unknown }) {
      if (session.user) {
        session.user.id = (token as { id: string }).id;
      }

      return session;
    },
  },
  experimental: { enableWebAuthn: true },
});
