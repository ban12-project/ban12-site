import { NextResponse, type NextMiddleware } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { i18n, middleware as i18nMiddleware } from './lib/i18n'

const protectedPaths: string[] = ['/dashboard'].flatMap((path) =>
  Object.keys(i18n.locales).map((locale) => `/${locale}${path}`),
)

const withTokenConflictPaths: string[] = ['/login', '/register'].flatMap(
  (path) => Object.keys(i18n.locales).map((locale) => `/${locale}${path}`),
)

export function middleware(...args: Parameters<NextMiddleware>) {
  return i18nMiddleware(...args, async (request) => {
    const { pathname } = request.nextUrl
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV !== 'development',
    })

    if (!token && protectedPaths.some((url) => pathname.startsWith(url))) {
      const redirectUrl = encodeURIComponent(request.url)

      return NextResponse.redirect(
        new URL(`/login?redirectUrl=${redirectUrl}`, request.url),
      )
    }

    if (
      token &&
      withTokenConflictPaths.some((url) => pathname.startsWith(url))
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  })
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml).*)',
  ],
}
