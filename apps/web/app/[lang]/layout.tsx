import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

import { LocaleProvider } from '@repo/i18n/client'
import type { Locale } from '#/i18n'
import { i18n } from '#/i18n'

import R3fEntry from '#/components/r3f-entry'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
  children: React.ReactNode
}>

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  applicationName: 'Ban12',
  title: {
    default: 'Ban12',
    template: '%s | Ban12',
  },
  description: 'Generated by create next app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ban12',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Ban12',
    title: {
      default: 'Ban12',
      template: '%s | Ban12',
    },
    description: 'Generated by create next app',
  },
  icons: {
    icon: { url: '/api/og?w=48&h=48&bg=transparent', type: 'image/png' },
    shortcut: { url: '/api/og?w=192&h=192&bg=transparent', type: 'image/png' },
    apple: [
      { url: '/api/og?w=64&h=64&bg=transparent', type: 'image/png' },
      {
        url: '/api/og?w=180&h=180&bg=transparent',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/api/og?w=180&h=180&bg=transparent',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
}

export default async function RootLayout(props: Props) {
  const params = await props.params

  const { children } = props

  return (
    <html lang={params.lang}>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900`}>
        <LocaleProvider locale={params.lang} i18n={i18n}>
          {children}
        </LocaleProvider>

        <R3fEntry />
      </body>
    </html>
  )
}
