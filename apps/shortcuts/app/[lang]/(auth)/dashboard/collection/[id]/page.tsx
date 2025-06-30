import { notFound } from 'next/navigation'

import { getCollectionById } from '#/lib/db/queries'

import Form from '../form'

export default async function EditCollectionPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const collection = await getCollectionById(Number.parseInt(params.id))

  if (!collection) notFound()

  return (
    <main className="container-full">
      <Form fields={collection} />
    </main>
  )
}
