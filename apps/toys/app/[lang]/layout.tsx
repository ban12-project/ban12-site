import '#/app/globals.css'

import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { LocaleProvider } from '@repo/i18n/client'
import { getDictionary, i18n, type Locale } from '#/i18n'
import { ThemeProvider } from 'next-themes'

import Header from '#/components/ui/header'
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
  params: Promise<{ lang: Locale }>
}

export default async function RootLayout(props: RootLayoutProps) {
  const params = await props.params;

  const {
    children
  } = props;

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
        { }
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

        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
