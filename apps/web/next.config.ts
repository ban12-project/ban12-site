import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.githubusercontent.com' },
      { protocol: 'https', hostname: 'www.gstatic.com' },
      { protocol: 'https', hostname: 'i0.hdslb.com' },
    ],
  },
  outputFileTracingIncludes: {
    '/*': ['./_posts/**/*.md'],
  },
  transpilePackages: ['@repo/ui', '@repo/i18n', 'three'],
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    rules: {
      // shader support
      '*.{glsl,vs,fs,vert,frag}': {
        loaders: ['raw-loader', 'glslify-loader'],
      },
    },
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})(nextConfig);

export default withBundleAnalyzer;
