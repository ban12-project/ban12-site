import type { Metadata, Viewport } from 'next'

import '#/app/globals.css'

import { GoogleAnalytics } from '@next/third-parties/google'
import { LocaleProvider } from '@repo/i18n/client'
import { Toaster } from '@repo/ui/components/sonner'
import { ThemeProvider } from 'next-themes'

import { getDictionary, i18n, type Locale } from '#/lib/i18n'
import { WebVitals } from '#/components/web-vitals'

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang as Locale)

  return {
    applicationName: 'Ban12',
    title: {
      default: 'Ban12',
      template: '%s | Ban12',
    },
    description: messages.description,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Ban12',
    },
    formatDetection: {
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: '/',
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}`]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: 'Ban12',
      title: {
        default: 'Ban12',
        template: '%s | Ban12',
      },
      description: messages.description,
    },
    icons: {
      icon: { url: '/api/og?w=48&h=48&bg=transparent', type: 'image/png' },
      shortcut: {
        url: '/api/og?w=192&h=192&bg=transparent',
        type: 'image/png',
      },
      apple: [
        { url: '/api/og?w=64&h=64&bg=transparent', type: 'image/png' },
        {
          url: '/api/og?w=180&h=180&bg=transparent',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: 'device-width',
  viewportFit: 'cover',
}

export async function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }))
}

export default async function RootLayout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params

  return (
    <html suppressHydrationWarning lang={lang}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={lang as Locale} i18n={i18n}>
            {children}
          </LocaleProvider>
        </ThemeProvider>

        <Toaster />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            <WebVitals />
          </>
        )}
      </body>
    </html>
  )
}
