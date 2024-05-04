import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  applicationName: 'Curriculum',
  title: {
    default: 'Curriculum',
    template: '%s | Curriculum',
  },
  description: 'Generated by create next app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Curriculum',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Curriculum',
    title: {
      default: 'Curriculum',
      template: '%s | Curriculum',
    },
    description: 'Generated by create next app',
  },
}

export const viewport: Viewport = {
  themeColor: '#fff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav>
          <Link href="/">home</Link>
          <Link href="/trigger-push-msg">trigger-push-msg</Link>
        </nav>
        {children}
      </body>
    </html>
  )
}
