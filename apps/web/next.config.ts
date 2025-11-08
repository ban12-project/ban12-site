import type { NextConfig } from 'next'
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/i18n', 'three'],
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    viewTransition: true,
    clientSegmentCache: true,
  },
  turbopack: {
    rules: {
      // shader support
      '*.{glsl,vs,fs,vert,frag}': {
        loaders: ['raw-loader', 'glslify-loader'],
      }
    }
  }
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig)

export default withBundleAnalyzer
