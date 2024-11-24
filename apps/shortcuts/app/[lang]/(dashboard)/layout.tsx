import '#/app/globals.css'

import { LocaleProvider } from '@repo/i18n/client'
import { SessionProvider } from 'next-auth/react'

import { auth } from '#/lib/auth'
import { i18n, type Locale } from '#/lib/i18n'
import { Toaster } from '#/components/ui/sonner'

type RootLayoutProps = {
  params: Promise<{ lang: Locale }>
  children: React.ReactNode
}

export default async function Layout(props: RootLayoutProps) {
  const params = await props.params

  const { children } = props

  const session = await auth()

  return (
    <html lang={params.lang}>
      <body>
        <LocaleProvider locale={params.lang} i18n={i18n}>
          <SessionProvider session={session}>{children}</SessionProvider>
        </LocaleProvider>

        <Toaster />
      </body>
    </html>
  )
}
