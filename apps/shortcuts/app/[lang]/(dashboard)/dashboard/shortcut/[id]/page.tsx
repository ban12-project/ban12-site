import { notFound } from 'next/navigation'

import { fetchShortcutByID } from '#/app/[lang]/(front)/actions'

import EditForm from './edit-form'

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function Page(props: Props) {
  const params = await props.params;
  const shortcut = await fetchShortcutByID(params.id)

  if (!shortcut) notFound()

  return (
    <main className="container-full">
      <EditForm shortcut={shortcut} />
    </main>
  )
}
