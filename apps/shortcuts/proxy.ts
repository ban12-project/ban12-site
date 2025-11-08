import { NextResponse, type NextProxy } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { i18n, middleware as i18nMiddleware } from './lib/i18n'

const protectedPaths: string[] = ['/dashboard'].flatMap((path) =>
  Object.keys(i18n.locales)
    .map((locale) => `/${locale}${path}`)
    .concat(path),
)

const withTokenConflictPaths: string[] = ['/login', '/register'].flatMap(
  (path) =>
    Object.keys(i18n.locales)
      .map((locale) => `/${locale}${path}`)
      .concat(path),
)

export async function proxy(...args: Parameters<NextProxy>) {
  const [request] = args
  const { pathname } = request.nextUrl

  if (
    !protectedPaths
      .concat(withTokenConflictPaths)
      .some((url) => pathname.startsWith(url))
  ) {
    return i18nMiddleware(...args)
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV !== 'development',
  })
  const locale = Object.keys(i18n.locales).find(
    (locale) => pathname.split('/')[1] === locale,
  )

  if (!token && protectedPaths.some((url) => pathname.startsWith(url))) {
    const redirectUrl = encodeURIComponent(request.url)

    return NextResponse.redirect(
      new URL(
        `${locale ? `/${locale}` : ''}/login?redirectUrl=${redirectUrl}`,
        request.url,
      ),
    )
  }

  if (token && withTokenConflictPaths.some((url) => pathname.startsWith(url))) {
    return NextResponse.redirect(
      new URL(`${locale ? `/${locale}` : ''}/dashboard`, request.url),
    )
  }

  return i18nMiddleware(...args)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml|.well-known).*)',
  ],
}
