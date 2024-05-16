export { middleware } from './i18n'

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|opengraph-image|robots.txt|sitemap.xml).*)',
  ],
}
