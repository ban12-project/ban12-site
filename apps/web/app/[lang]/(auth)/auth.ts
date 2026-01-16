import { DrizzleAdapter } from '@auth/drizzle-adapter';
import NextAuth, { type Session, type User } from 'next-auth';
import Passkey from 'next-auth/providers/passkey';
import { db } from '#/lib/db/queries';
import { authConfig } from './auth.config';

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
  providers: [Passkey],
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
