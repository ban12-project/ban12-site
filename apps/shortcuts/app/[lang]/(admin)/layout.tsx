import '#/app/globals.css'

import { auth, signOut } from '#/auth'
import { Locale } from '#/i18n-config'

import { Button } from '#/components/ui/button'
import { Toaster } from '#/components/ui/sonner'
import { LocaleProvider } from '#/components/i18n'

type RootLayoutProps = {
  params: { lang: Locale }
  children: React.ReactNode
}

export default async function Layout({ params, children }: RootLayoutProps) {
  const session = await auth()

  return (
    <html lang={params.lang}>
      <body>
        <LocaleProvider locale={params.lang}>
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
