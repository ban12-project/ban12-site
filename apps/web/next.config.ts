import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/ui', '@repo/i18n', 'three'],
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    viewTransition: true,
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
