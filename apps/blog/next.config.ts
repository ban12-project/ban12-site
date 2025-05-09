import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.vuejs.org',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.ban12.com',
      },
    ],
  },
  transpilePackages: ['@repo/ui'],
  experimental: {
    viewTransition: true,
  },
}

export default nextConfig
