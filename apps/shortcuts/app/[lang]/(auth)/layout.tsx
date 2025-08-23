import '#/app/globals.css'

import { LocaleProvider } from '@repo/i18n/client'
import { Toaster } from '@repo/ui/components/sonner'
import { SessionProvider } from 'next-auth/react'

import { auth } from '#/lib/auth'
import { i18n, type Locale } from '#/lib/i18n'

export default async function Layout(props: Omit<LayoutProps<'/[lang]'>, 'get' | 'post'>) {
  const params = await props.params

  const { children } = props

  const session = await auth()

  return (
    <html lang={params.lang}>
      <body>
        <LocaleProvider locale={params.lang as Locale} i18n={i18n}>
          <SessionProvider session={session}>{children}</SessionProvider>
        </LocaleProvider>

        <Toaster />
      </body>
    </html>
  )
}
