import { notFound } from 'next/navigation'

import prisma from '#/lib/prisma'

import Form from '../form'

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string }
}) {
  const collection = await prisma.collection.findUnique({
    where: { id: Number.parseInt(params.id) },
  })

  if (!collection) notFound()

  return (
    <main className="container-full">
      <Form fields={collection} />
    </main>
  )
}
