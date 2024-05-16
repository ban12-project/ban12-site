import { notFound } from 'next/navigation'

import prisma from '#/lib/prisma'

import Form from '../form'

export default async function EditAlbumPage({
  params,
}: {
  params: { id: string }
}) {
  const album = await prisma.album.findUnique({
    where: { id: Number.parseInt(params.id) },
  })

  if (!album) notFound()

  return (
    <main className="container-full">
      <Form fields={album} />
    </main>
  )
}
