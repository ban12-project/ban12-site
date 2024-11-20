import { notFound } from 'next/navigation'
import { db } from '#/drizzle/db'

import Form from '../form'

export default async function EditCollectionPage(
  props: {
    params: Promise<{ id: string }>
  }
) {
  const params = await props.params;
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
