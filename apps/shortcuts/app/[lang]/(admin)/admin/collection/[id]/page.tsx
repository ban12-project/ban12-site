import { notFound } from 'next/navigation'
import { db } from '#/drizzle/db'

import Form from '../form'

export default async function EditCollectionPage({
  params,
}: {
  params: { id: string }
}) {
  const collection = await db.query.collection.findFirst({
    where: (collection, { eq }) =>
      eq(collection.id, Number.parseInt(params.id)),
  })

  if (!collection) notFound()

  return (
    <main className="container-full">
      <Form fields={collection} />
    </main>
  )
}
