import { Metadata } from 'next'
import { getDictionary, Locale } from '#/i18n'

import { QRCodeForm } from '#/components/ui/qrcode-form'

type Props = {
  params: Promise<{
    lang: Locale
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const messages = await getDictionary(params.lang)

  return {
    title: messages['page-hash'].title,
    description: messages['page-hash'].description,
  }
}

export default async function QRCodePage(props: Props) {
  const params = await props.params;
  const messages = await getDictionary(params.lang)

  return (
    <section className="h-screen w-screen flex justify-center align-middle">
      <QRCodeForm />
    </section>
  )
}
