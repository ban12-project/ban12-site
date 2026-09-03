import Lenis from '@repo/ui/components/lenis';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

import Footer from '#/components/blog/footer';
import { CMS_NAME, HOME_OG_IMAGE_URL } from '#/lib/blog/constants';

export const metadata: Metadata = {
  title: {
    template: `%s | ${CMS_NAME}`,
    default: CMS_NAME,
  },
  description:
    '一个专注于分享前沿 Web 技术、开发经验和最佳实践的博客。探索 JavaScript、React、Node.js 等前端和后端技术，以及网站性能优化、响应式设计等实用知识。',
  openGraph: {
    images: [HOME_OG_IMAGE_URL],
  },
};

export default function BlogLayout({ children }: LayoutProps<'/[lang]'>) {
  return (
    <>
      {children}
      <Footer />
      <Lenis root />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
