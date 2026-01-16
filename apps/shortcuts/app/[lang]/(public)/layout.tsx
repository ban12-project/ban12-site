import '#/app/globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import { LocaleProvider } from '@repo/i18n/client';
import { Toaster } from '@repo/ui/components/sonner';
import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
// import CSSPaintPolyfill from '#/components/css-paint-polyfill'
import { WebVitals } from '#/components/web-vitals';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';

const SentryLoader = dynamic(() => import('#/components/sentry-loader'));

export async function generateMetadata(
  props: LayoutProps<'/[lang]'>,
): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang as Locale);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL!),
    alternates: {
      canonical: '/',
      languages: Object.fromEntries(
        Object.keys(i18n.locales).map((lang) => [lang, `/${lang}`]),
      ),
    },
    title: {
      default: `${messages['title-default']} - ${messages.title}`,
      template: `%s - ${messages.title} by ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    },
    description: messages.description,
    openGraph: {
      images: `https://ban12.com/api/og?title=${messages.title}`,
    },
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
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }));
}

export default async function RootLayout(props: LayoutProps<'/[lang]'>) {
  const params = await props.params;

  const { children, get, post } = props;

  return (
    <html
      lang={params.lang}
      dir={params.lang === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body className="bg-white font-sans text-black antialiased dark:bg-black dark:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider locale={params.lang as Locale} i18n={i18n}>
            {children}
            {get}
            {post}
          </LocaleProvider>
        </ThemeProvider>

        <Toaster />

        {/* <CSSPaintPolyfill /> */}

        {process.env.NODE_ENV !== 'development' && <SentryLoader />}

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
