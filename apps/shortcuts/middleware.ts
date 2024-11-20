import { type NextMiddleware } from 'next/server'

import { auth } from './lib/auth'
import { middleware as i18nMiddleware } from './lib/i18n'

export function middleware(...args: Parameters<NextMiddleware>) {
  // @ts-expect-error - `auth` is next-auth middleware
  return i18nMiddleware(...args, auth)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml).*)',
  ],
}
