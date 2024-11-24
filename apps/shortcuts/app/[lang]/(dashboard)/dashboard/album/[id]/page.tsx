import { notFound } from 'next/navigation'

import { getAlbumById } from '#/lib/db/queries'

import Form from '../form'

export default async function EditAlbumPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const album = await getAlbumById(Number.parseInt(params.id))

  if (!album) notFound()

  return (
    <main className="container-full">
      <Form fields={album} />
    </main>
  )
}
