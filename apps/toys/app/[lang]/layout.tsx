import '#/app/globals.css'

import { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { LocaleProvider } from '@repo/i18n/client'
// import Lenis from '@repo/ui/lenis'
import { getDictionary, i18n, type Locale } from '#/i18n'
import { ThemeProvider } from 'next-themes'

import { Toaster } from '#/components/ui/sonner'
import Header from '#/components/header'

export async function generateMetadata({
  params,
}: RootLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: '/',
      languages: {
        'zh-CN': '/zh-CN',
        en: '/en',
      },
    },
    title: {
      default: messages.home.title,
      template: `%s - Toys by Ban12`,
    },
    openGraph: {
      images: 'https://ban12.com/api/og?title=Toys',
    },
  }
}

export const viewport: Viewport = {
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
  const params = await props.params

  const { children } = props

  const messages = await getDictionary(params.lang)

  return (
    <html suppressHydrationWarning lang={params.lang}>
      <body className="bg-slate-50 text-gray-800/80 dark:bg-slate-900 dark:text-gray-200/80">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={params.lang} i18n={i18n}>
            <Header messages={messages} lang={params.lang} />

            {children}
          </LocaleProvider>
        </ThemeProvider>

        <Toaster />

        {/* <Lenis root gsap scrollTrigger /> */}

        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  )
}
