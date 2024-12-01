import { type NextMiddleware } from 'next/server'
import NextAuth from 'next-auth'

import { authConfig } from './lib/auth.config'
import { middleware as i18nMiddleware } from './lib/i18n'

export function middleware(...args: Parameters<NextMiddleware>) {
  // @ts-expect-error - `auth` is next-auth middleware
  return i18nMiddleware(...args, NextAuth(authConfig).auth)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml|7e627e61786840fd89f484db5cf96824.txt).*)',
  ],
}
