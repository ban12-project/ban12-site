import type { NextConfig } from 'next'
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import bundleAnalyzer from '@next/bundle-analyzer'

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform()
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.ban12.com',
      },
    ],
  },
  transpilePackages: ['@repo/i18n', '@repo/ui'],
  experimental: {
    reactCompiler: true,
  },
}

export default bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
