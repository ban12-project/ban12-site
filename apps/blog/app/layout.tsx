import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Lenis from '@repo/ui/lenis'
import { Analytics } from '@vercel/analytics/react'

import { CMS_NAME, HOME_OG_IMAGE_URL } from '#/lib/constants'
import Footer from '#/components/footer'

import './globals.css'

import { cn } from '@repo/ui/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: `%s | ${CMS_NAME}`,
    default: CMS_NAME,
  },
  description:
    '一个专注于分享前沿Web技术、开发经验和最佳实践的博客。探索JavaScript、React、Node.js等前端和后端技术，以及网站性能优化、响应式设计等实用知识。',
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
    <html lang="zh-CN" className="system">
      <body
        className={cn(
          inter.className,
          'max-w-screen min-h-screen overflow-x-hidden',
        )}
      >
        {children}
        <Footer />
        <Lenis root />
        <Analytics />
      </body>
    </html>
  )
}
