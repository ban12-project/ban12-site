import '#/app/globals.css'

import { Metadata, Viewport } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { LocaleProvider } from '@repo/i18n/client'
import { Toaster } from '@repo/ui/components/sonner'
import { ThemeProvider } from 'next-themes'

// import Lenis from '@repo/ui/lenis'
import { getDictionary, i18n, type Locale } from '#/lib/i18n'
import Header from '#/components/header'

export async function generateMetadata({
  params,
}: RootLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return {
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
    icons: {
      icon: {
        url: 'https://ban12.com/api/og?w=48&h=48&bg=transparent',
        type: 'image/png',
      },
      shortcut: {
        url: 'https://ban12.com/api/og?w=192&h=192&bg=transparent',
        type: 'image/png',
      },
      apple: [
        {
          url: 'https://ban12.com/api/og?w=64&h=64&bg=transparent',
          type: 'image/png',
        },
        {
          url: 'https://ban12.com/api/og?w=180&h=180&bg=transparent',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
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

export async function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }))
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
            <Header />

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
