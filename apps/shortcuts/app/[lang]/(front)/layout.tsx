import '#/app/globals.css'

import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { LocaleProvider } from '@repo/i18n/client'
import { getDictionary, i18n, type Locale } from '#/i18n'
import { ThemeProvider } from 'next-themes'

import { cn } from '#/lib/utils'
import { Toaster } from '#/components/ui/sonner'
// import CSSPaintPolyfill from '#/components/css-paint-polyfill'
import { WebVitals } from '#/components/web-vitals'

const SentryLoader = dynamic(() => import('#/components/sentry-loader'))

type RootLayoutProps = {
  params: Promise<{ lang: Locale }>
  children: React.ReactNode
  get: React.ReactNode
  post: React.ReactNode
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export async function generateMetadata(
  props: RootLayoutProps,
): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang)

  return {
    title: {
      default: messages.title,
      template: `%s - ${messages.title} by ${process.env.SITE_NAME}`,
    },
    openGraph: {
      images: `https://ban12.com/api/og?title=${messages.title}`,
    }
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout(props: RootLayoutProps) {
  const params = await props.params

  const { children, get, post } = props

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <body
        className={cn(
          'bg-white font-sans text-black antialiased dark:bg-black dark:text-white',
          inter.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={params.lang} i18n={i18n}>
            {children}
            {get}
            {post}
          </LocaleProvider>
        </ThemeProvider>

        <Toaster />

        {/* <CSSPaintPolyfill /> */}

        {process.env.NODE_ENV !== 'development' && <SentryLoader />}

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
