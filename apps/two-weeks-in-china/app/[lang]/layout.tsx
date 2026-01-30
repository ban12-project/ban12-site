import { LocaleProvider } from '@repo/i18n/client';
import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import { getDictionary, i18n, type Locale } from '#/lib/i18n';
import '#/app/globals.css';
import { Footer } from '#/components/footer';
import { Header } from '#/components/header';

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
    title: dict.common.title,
    description: dict.common.description,
    metadataBase: new URL('https://twoweeksinchina.com'),
  };
}

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
      </body>
    </html>
  );
}
