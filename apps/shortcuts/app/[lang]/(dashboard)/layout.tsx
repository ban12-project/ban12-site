import '#/app/globals.css'

import { LocaleProvider } from '@repo/i18n/client'
import { i18n, type Locale } from '#/lib/i18n'

import { Toaster } from '#/components/ui/sonner'

type RootLayoutProps = {
  params: Promise<{ lang: Locale }>
  children: React.ReactNode
}

export default async function Layout(props: RootLayoutProps) {
  const params = await props.params

  const { children } = props

  return (
    <html lang={params.lang}>
      <body>
        <LocaleProvider locale={params.lang} i18n={i18n}>
          {children}
        </LocaleProvider>

        <Toaster />
      </body>
    </html>
  )
}
