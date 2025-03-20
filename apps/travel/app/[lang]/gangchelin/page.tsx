import { getDictionary, type Locale } from '#/lib/i18n'

type Props = Readonly<{
  params: Promise<{ lang: Locale }>
}>

export default async function GANGCHELIN({ params }: Props) {
  const { lang } = await params
  const message = await getDictionary(lang)

  return (
    <h1>{message['under-construction']}</h1>
  )
}
