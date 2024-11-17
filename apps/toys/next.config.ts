/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true, // Recommended for the `pages` directory, default in `app`.
  webpack(config, { isServer, dev }) {
    // Use the client static directory in the server bundle and prod mode
    // Fixes `Error occurred prerendering page "/"`
    config.output.webassemblyModuleFilename =
      isServer && !dev
        ? '../static/wasm/[modulehash].wasm'
        : 'static/wasm/[modulehash].wasm'

    // Since Webpack 5 doesn't enable WebAssembly by default, we should do it manually
    config.experiments = { ...config.experiments, asyncWebAssembly: true }

    return config
  },
  transpilePackages: ['@repo/i18n', '@repo/ui'],
  experimental: {
    reactCompiler: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'cross-origin-opener-policy',
            value: 'same-origin',
          },
          {
            key: 'cross-origin-embedder-policy',
            value: 'require-corp',
          },
        ],
      },
    ]
  },
}

export default nextConfig
