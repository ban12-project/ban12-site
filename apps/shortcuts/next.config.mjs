import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'
import bundleAnalyzer from '@next/bundle-analyzer'

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.ban12.com',
      },
    ],
  },
  transpilePackages: ['@repo/i18n'],
}

export default bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)
