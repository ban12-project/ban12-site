import { LocaleProvider } from '@repo/i18n/client';
import type { Metadata, Viewport } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';
import '#/app/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Footer } from '#/components/footer';
import { Header } from '#/components/header';
import { WebVitals } from '#/components/web-vitals';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: {
      default: dict.common.title,
      template: `%s | ${dict.common.title}`,
    },
    description: dict.common.description,
    metadataBase: new URL('https://twoweeksinchina.com'),
    applicationName: dict.common.title,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: dict.common.title,
    },
    openGraph: {
      title: dict.common.title,
      description: dict.common.description,
      url: 'https://twoweeksinchina.com',
      siteName: dict.common.title,
      images: [
        {
          url: '/opengraph-image.png',
          width: 512,
          height: 512,
          alt: dict.common.title,
        },
      ],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.common.title,
      description: dict.common.description,
      images: ['/opengraph-image.png'],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#191a23' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  initialScale: 1,
  width: 'device-width',
  viewportFit: 'cover',
};

export async function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} className={`${spaceGrotesk.variable} antialiased`}>
      <body className="bg-light min-h-screen text-dark flex flex-col">
        <LocaleProvider i18n={i18n} locale={lang as Locale}>
          <Header dict={dict} lang={lang} />
          <main className="flex-1 pt-20">{children}</main>
          <Footer dict={dict} lang={lang} />
        </LocaleProvider>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
            <WebVitals />
          </>
        )}
      </body>
    </html>
  );
}
