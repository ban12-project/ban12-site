import '#/app/globals.css'

import { LocaleProvider } from '@repo/i18n/client'
import { auth, signOut } from '#/auth'
import { i18n, type Locale } from '#/i18n'

import { Button } from '#/components/ui/button'
import { Toaster } from '#/components/ui/sonner'

type RootLayoutProps = {
  params: { lang: Locale }
  children: React.ReactNode
}

export default async function Layout({ params, children }: RootLayoutProps) {
  const session = await auth()

  return (
    <html lang={params.lang}>
      <body>
        <LocaleProvider locale={params.lang} i18n={i18n}>
          <header className="flex">
            {session && (
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
                className="ml-auto"
              >
                <Button variant="ios">Sign Out</Button>
              </form>
            )}
          </header>

          {children}
        </LocaleProvider>

        <Toaster />
      </body>
    </html>
  )
}
