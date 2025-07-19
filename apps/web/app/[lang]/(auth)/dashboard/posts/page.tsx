import { Suspense } from 'react'

import { getPosts } from '#/lib/db/queries'

import { DataTable } from '../data-table'
import { columns } from './columns'
import Filter from './filter'

export default function PostsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Suspended />
    </Suspense>
  )
}

async function Suspended() {
  const data = await getPosts()

  return <DataTable columns={columns} data={data} header={Filter} />
}
