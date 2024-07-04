import '#/app/globals.css'

import Script from 'next/script'
import { LocaleProvider } from '@repo/i18n/client'
import { Analytics } from '@vercel/analytics/react'
import { getDictionary, i18n, type Locale } from '#/i18n'
import { ThemeProvider } from 'next-themes'

import * as gtag from '#/lib/gtag'
import Header from '#/components/ui/header'
import GoogleAnalytics from '#/components/google-analytics'
import LenisMount from '#/components/lenis'

export const metadata = {
  title: {
    default: 'Ban12',
    template: '%s - Ban12',
  },
}

export const viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { lang: Locale }
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const messages = await getDictionary(params.lang)

  return (
    <html suppressHydrationWarning lang={params.lang} className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0B1120')
                }
              } catch (_) {}
            `,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <Script
          id="babylonjs-core"
          strategy="beforeInteractive"
          src="https://cdn.babylonjs.com/babylon.js"
        />
      </head>
      <body className="bg-slate-50 text-gray-800/80 dark:bg-slate-900 dark:text-gray-200/80">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={params.lang} i18n={i18n}>
            <LenisMount>
              <Header messages={messages} lang={params.lang} />

              {children}
            </LenisMount>
          </LocaleProvider>
        </ThemeProvider>

        {gtag.GA_TRACKING_ID && (
          <GoogleAnalytics GA_TRACKING_ID={gtag.GA_TRACKING_ID} />
        )}
        <Analytics />
      </body>
    </html>
  )
}
