import { notFound } from 'next/navigation'
import { db } from '#/drizzle/db'

import Form from '../form'

export default async function EditAlbumPage({
  params,
}: {
  params: { id: string }
}) {
  const album = await db.query.album.findFirst({
    where: (album, { eq }) => eq(album.id, Number.parseInt(params.id)),
  })

  if (!album) notFound()

  return (
    <main className="container-full">
      <Form fields={album} />
    </main>
  )
}
