import NextAuth, { type NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { pathToRegexp } from 'path-to-regexp'
import { z } from 'zod'

import { db } from './drizzle/db'
import { i18n } from './i18n'

async function getUser(email: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.email, email),
    })
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}

// /admin => /(en|zh-CN)/admin
const adminRoutes = ['/admin'].map(
  (path) => `/(${Object.keys(i18n.locales).join('|')})${path}/(.*)?`,
)
const loginRoute = `/(${Object.keys(i18n.locales).join('|')})/login`

const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = adminRoutes.some((path) =>
        pathToRegexp(path).exec(nextUrl.pathname),
      )
      const isOnLogin = pathToRegexp(loginRoute).exec(nextUrl.pathname)
      if (isOnAdmin) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/admin', nextUrl))
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
  ],
} satisfies NextAuthConfig

export const { auth, signIn, signOut } = NextAuth(authConfig)
