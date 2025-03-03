import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

import { CMS_NAME, HOME_OG_IMAGE_URL } from '#/lib/constants'
import Footer from '#/app/_components/footer'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `Next.js Blog Example with ${CMS_NAME}`,
  description: `A statically generated blog example using Next.js and ${CMS_NAME}.`,
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
  icons: {
    icon: {
      url: new URL('/api/og?w=48&h=48&bg=transparent', HOME_OG_IMAGE_URL),
      type: 'image/png',
    },
    shortcut: {
      url: new URL('/api/og?w=192&h=192&bg=transparent', HOME_OG_IMAGE_URL),
      type: 'image/png',
    },
    apple: [
      {
        url: new URL('/api/og?w=64&h=64&bg=transparent', HOME_OG_IMAGE_URL),
        type: 'image/png',
      },
      {
        url: new URL('/api/og?w=180&h=180&bg=transparent', HOME_OG_IMAGE_URL),
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen">{children}</div>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
