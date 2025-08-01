import { NextResponse } from 'next/server'
import type { NextMiddleware, NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

import type { I18nConfig } from './server'

export function createMiddleware(i18n: I18nConfig) {
  function getLocale(request: NextRequest): string {
    // Negotiator expects plain object so we need to transform headers
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

    const locales: string[] = Object.keys(i18n.locales)

    // Use negotiator and intl-localematcher to get best locale
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
      locales,
    )

    const locale = matchLocale(languages, locales, i18n.defaultLocale)

    return locale
  }

  return function middleware(
    ...args: [...Parameters<NextMiddleware>, nextMiddleware?: NextMiddleware]
  ) {
    const [request, event, nextMiddleware] = args
    const { pathname, search } = request.nextUrl

    // // `/_next/` and `/api/` are ignored by the watcher, but we need to ignore files in `public` manually.
    // // If you have one
    // if (
    //   [
    //     '/manifest.json',
    //     '/favicon.ico',
    //     // Your other files in `public`
    //   ].includes(pathname)
    // )
    //   return

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = Object.keys(i18n.locales).every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
      const locale = getLocale(request)

      // If match default locale ignore it
      if (locale === i18n.defaultLocale)
        return NextResponse.rewrite(
          new URL(
            `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${search}`,
            request.url,
          ),
        )

      // Avoids double redirect: / => /en/ => /en
      if (pathname === '/')
        return NextResponse.redirect(
          new URL(`/${locale}${search}`, request.url),
        )

      // e.g. incoming request is /products
      // The new URL is now /en-US/products
      return NextResponse.redirect(
        new URL(
          `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}${search}`,
          request.url,
        ),
      )
    }

    if (typeof nextMiddleware === 'function')
      return nextMiddleware(request, event)
  }
}
