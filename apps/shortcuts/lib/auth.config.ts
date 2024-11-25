import type { NextAuthConfig } from 'next-auth'
import { pathToRegexp } from 'path-to-regexp'

import { i18n } from './i18n'

// /dashboard => /(en|zh-CN)/dashboard
const dashboardRoutes = ['/dashboard'].map(
  (path) => `/(${Object.keys(i18n.locales).join('|')})${path}/(.*)?`,
)
const loginRoute = `/(${Object.keys(i18n.locales).join('|')})/login`

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isDashboard = dashboardRoutes.some((path) =>
        pathToRegexp(path).exec(request.nextUrl.pathname),
      )
      const isOnLogin = pathToRegexp(loginRoute).exec(request.nextUrl.pathname)
      if (isDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', request.nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
