import '#/app/globals.css'

import type { Metadata } from 'next'
import { LocaleProvider } from '@repo/i18n/client'
import Lenis from '@repo/ui/components/lenis'
import { ThemeProvider } from 'next-themes'

import { getDictionary, i18n, type Locale } from '#/lib/i18n'
import { LivePhotosKitLoader } from '#/components/live-photos-kit'

type RootLayoutProps = Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: Locale }>
}>

export async function generateMetadata({
  params,
}: RootLayoutProps): Promise<Metadata> {
  const { lang } = await params
  const messages = await getDictionary(lang)

  return {
    title: messages['default-title'],
    description: messages['default-description'],
    alternates: {
      canonical: '/',
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}`]),
      ),
    },
    openGraph: {
    images: 'https://ban12.com/api/og',
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

export async function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }))
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { lang } = await params

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={lang} i18n={i18n}>
            {children}
          </LocaleProvider>
        </ThemeProvider>

        <Lenis root gsap scrollTrigger />
        <LivePhotosKitLoader />
      </body>
    </html>
  )
}
