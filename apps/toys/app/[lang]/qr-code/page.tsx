import { Metadata } from 'next'
import Script from 'next/script'

import { getDictionary, type Locale } from '#/lib/i18n'
import { QRCodeForm } from '#/components/qrcode-form'

export async function generateMetadata(props: PageProps<'/[lang]/qr-code'>): Promise<Metadata> {
  const params = await props.params
  const messages = await getDictionary(params.lang as Locale)

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
  }
}

export default async function QRCodePage(props: PageProps<'/[lang]/qr-code'>) {
  const params = await props.params
  const messages = await getDictionary(params.lang as Locale)

  return (
    <section className="flex h-screen w-screen justify-center align-middle">
      <QRCodeForm />

      <Script
        id="babylonjs-core"
        strategy="beforeInteractive"
        src="https://cdn.babylonjs.com/babylon.js"
      />
    </section>
  )
}
