import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next 16 uses Turbopack by default. Keep SVG transformation here so the
  // same rule is used by dev and production builds.
  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: { overrides: { mergePaths: false } },
                  },
                ],
              },
            },
          },
        ],
        as: '*.js',
      },
    },
  },
  transpilePackages: ['@repo/i18n', '@repo/ui'],
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForBuild: true,
    useTypeScriptCli: true,
  },
  // Keep the explicit webpack fallback for `next build --webpack`. Normal
  // development and production builds use the Turbopack config above.
  webpack(config, { isServer, webpack }) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    const fileLoaderRule = config.module.rules.find(
      (rule: { test?: { test?: (value: string) => boolean } }) =>
        rule.test?.test?.('.svg'),
    );

    if (fileLoaderRule) {
      const {
        loader: _fileLoader,
        use: _fileLoaderUse,
        options: _fileLoaderOptions,
        ...fileLoaderBaseRule
      } = fileLoaderRule as Record<string, unknown>;

      config.module.rules.push(
        {
          ...fileLoaderBaseRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          ...fileLoaderBaseRule,
          test: /\.svg$/i,
          resourceQuery: /no-merge-paths/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: { overrides: { mergePaths: false } },
                    },
                  ],
                },
              },
            },
          ],
        },
        {
          ...fileLoaderBaseRule,
          test: /\.svg$/i,
          resourceQuery: {
            not: [
              ...(fileLoaderRule.resourceQuery?.not ?? []),
              /url/,
              /no-merge-paths/,
            ],
          },
          use: ['@svgr/webpack'],
        },
      );
      fileLoaderRule.exclude = /\.svg$/i;
    }

    if (!isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({ resourceRegExp: /^node:fs\/promises$/ }),
      );
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'cross-origin-opener-policy', value: 'same-origin' },
          { key: 'cross-origin-embedder-policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
