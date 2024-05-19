import { type NextMiddleware } from 'next/server'

import { auth } from './auth'
import { i18n, middleware as i18nMiddleware } from './i18n'

export function middleware(...args: Parameters<NextMiddleware>) {
  const [request] = args
  const { pathname } = request.nextUrl

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = Object.keys(i18n.locales).every(
    (locale) =>
      !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  if (pathnameIsMissingLocale) return i18nMiddleware(...args)

  // @ts-ignore
  return auth(...args)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml).*)',
  ],
}
