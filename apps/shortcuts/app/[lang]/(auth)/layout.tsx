import '#/app/globals.css';

import { LocaleProvider } from '@repo/i18n/client';
import { Toaster } from '@repo/ui/components/sonner';
import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';

import { auth } from '#/lib/auth';
import { i18n, type Locale } from '#/lib/i18n';

export function generateStaticParams() {
  return Object.keys(i18n.locales).map((lang) => ({ lang }));
}

export default async function Layout({
  params,
  children,
}: Omit<LayoutProps<'/[lang]'>, 'get' | 'post'>) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body>
        <LocaleProvider locale={lang as Locale} i18n={i18n}>
          <Suspense fallback="Loading">
            <Suspended>{children}</Suspended>
          </Suspense>
        </LocaleProvider>

        <Toaster />
      </body>
    </html>
  );
}

async function Suspended({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
