import { notFound } from 'next/navigation'

import { fetchShortcutByID } from '#/lib/actions'

import EditForm from './edit-form'

type Props = {
  params: {
    id: string
  }
}

export default async function Page({ params }: Props) {
  const shortcut = await fetchShortcutByID(params.id)

  if (!shortcut) notFound()

  return (
    <main className="container-full">
      <EditForm shortcut={shortcut} />
    </main>
  )
}
