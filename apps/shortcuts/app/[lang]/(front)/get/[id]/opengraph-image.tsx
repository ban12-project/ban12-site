import { notFound } from 'next/navigation'
import { Pool } from '@neondatabase/serverless'

import OpengraphImage from '#/components/opengraph-image'

export const runtime = 'edge'

export default async function Image({ params }: { params: { id: string } }) {
  const connectionString = `${process.env.DATABASE_URL}`
  const pool = new Pool({ connectionString })
  const {
    rows: [shortcut],
  } = await pool.query('SELECT * FROM Shortcut WHERE id = $1 LIMIT 1', [
    params.id,
  ])
  pool.end()

  if (!shortcut) notFound()

  return await OpengraphImage({ title: shortcut.name })
}
