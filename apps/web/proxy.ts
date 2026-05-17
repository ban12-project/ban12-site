import { getSessionCookie } from 'better-auth/cookies';
import { type NextProxy, NextResponse } from 'next/server';

import { auth } from './lib/auth';
import { i18n, middleware as i18nMiddleware } from './lib/i18n';

async function hasValidSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: {
      disableCookieCache: true,
    },
  });

  return Boolean(session);
}

const protectedPaths: string[] = ['/dashboard'].flatMap((path) =>
  Object.keys(i18n.locales)
    .map((locale) => `/${locale}${path}`)
    .concat(path),
);

const withTokenConflictPaths: string[] = ['/login', '/register'].flatMap(
  (path) =>
    Object.keys(i18n.locales)
      .map((locale) => `/${locale}${path}`)
      .concat(path),
);

export async function proxy(...args: Parameters<NextProxy>) {
  const [request] = args;
  const { pathname } = request.nextUrl;

  if (
    !protectedPaths
      .concat(withTokenConflictPaths)
      .some((url) => pathname.startsWith(url))
  ) {
    return i18nMiddleware(...args);
  }

  const sessionCookie = getSessionCookie(request);
  const hasSession = sessionCookie ? await hasValidSession(request) : false;
  const locale = Object.keys(i18n.locales).find(
    (locale) => pathname.split('/')[1] === locale,
  );

  if (!hasSession && protectedPaths.some((url) => pathname.startsWith(url))) {
    const redirectUrl = encodeURIComponent(request.url);

    return NextResponse.redirect(
      new URL(
        `${locale ? `/${locale}` : ''}/login?redirectUrl=${redirectUrl}`,
        request.url,
      ),
    );
  }

  if (
    hasSession &&
    withTokenConflictPaths.some((url) => pathname.startsWith(url))
  ) {
    return NextResponse.redirect(
      new URL(`${locale ? `/${locale}` : ''}/dashboard`, request.url),
    );
  }

  return i18nMiddleware(...args);
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml|.well-known|sw.js|manifest.json|.*\\.glb$).*)',
  ],
};
