import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'

initOpenNextCloudflareForDev()

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/i18n', '@repo/ui'],
  experimental: {
    reactCompiler: true,
    viewTransition: true,
  },
}

export default nextConfig
