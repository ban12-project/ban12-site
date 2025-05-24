import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/i18n', '@repo/ui'],
  experimental: {
    reactCompiler: true,
    viewTransition: true,
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
