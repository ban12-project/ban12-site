import '#/app/globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { LocaleProvider } from '@repo/i18n/client';
import { Toaster } from '@repo/ui/components/sonner';
import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from 'next-themes';
import Footer from '#/components/footer';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  const messages = await getDictionary(lang as Locale);
  const siteUrl = process.env.NEXT_PUBLIC_HOST_URL ?? 'https://toys.ban12.com';

  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/${lang}`,
      languages: {
        'zh-CN': '/zh-CN',
        en: '/en',
      },
    },
    title: {
      default: messages.home.title,
      template: `%s - Toys by Ban12`,
    },
    openGraph: {
      type: 'website',
      siteName: 'Ban12 Toys',
      locale: lang === 'zh-CN' ? 'zh_CN' : 'en_US',
      images: 'https://ban12.com/api/og?title=Toys',
    },
    twitter: { card: 'summary_large_image' },
    icons: {
      icon: {
        url: 'https://ban12.com/api/og?w=48&h=48&bg=transparent',
        type: 'image/png',
      },
      shortcut: {
        url: 'https://ban12.com/api/og?w=192&h=192&bg=transparent',
        type: 'image/png',
      },
      apple: [
        {
          url: 'https://ban12.com/api/og?w=64&h=64&bg=transparent',
          type: 'image/png',
        },
        {
          url: 'https://ban12.com/api/og?w=180&h=180&bg=transparent',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#f8fafc',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }));
}

export default async function RootLayout(props: LayoutProps<'/[lang]'>) {
  const params = await props.params;
  const { children } = props;

  return (
    <html suppressHydrationWarning lang={params.lang}>
      <body className="bg-slate-50 text-gray-800/80 dark:bg-slate-900 dark:text-gray-200/80">
        <a
          href="#main-content"
          className="fixed -left-[9999px] top-4 z-50 rounded-md bg-white px-4 py-2 text-slate-950 transition-[left] focus:left-4 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {params.lang === 'zh-CN' ? '跳转到主要内容' : 'Skip to content'}
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={params.lang as Locale} i18n={i18n}>
            {children}
            <Footer />
          </LocaleProvider>
        </ThemeProvider>

        <Toaster />

        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
