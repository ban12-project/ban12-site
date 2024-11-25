import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Passkey from 'next-auth/providers/passkey'
import { pathToRegexp } from 'path-to-regexp'
import { z } from 'zod'

import { db, getUser } from './db/queries'
import { i18n } from './i18n'

// /dashboard => /(en|zh-CN)/dashboard
const dashboardRoutes = ['/dashboard'].map(
  (path) => `/(${Object.keys(i18n.locales).join('|')})${path}/(.*)?`,
)
const loginRoute = `/(${Object.keys(i18n.locales).join('|')})/login`

const authConfig = {
  adapter: DrizzleAdapter(db),
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = dashboardRoutes.some((path) =>
        pathToRegexp(path).exec(nextUrl.pathname),
      )
      const isOnLogin = pathToRegexp(loginRoute).exec(nextUrl.pathname)
      if (isDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)
          if (!user) return null
          // TODO: Implement salt and hash password
          const passwordsMatch = password === user.password

          if (passwordsMatch) return user
        }

        return null
      },
    }),
    Passkey,
  ],
  experimental: { enableWebAuthn: true },
} satisfies NextAuthConfig

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig)
