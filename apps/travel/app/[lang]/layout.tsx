import '#/app/globals.css'

import type { Metadata } from 'next'
import { LocaleProvider } from '@repo/i18n/client'
import Lenis from '@repo/ui/lenis'
import { ThemeProvider } from 'next-themes'

import { getDictionary, i18n, type Locale } from '#/lib/i18n'

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
      </body>
    </html>
  )
}
