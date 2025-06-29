'use cache'

import { Suspense } from 'react'

import { getRestaurants } from '#/lib/db/queries'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function DashboardPage() {
  return (
    <Suspense>
      <Suspended />
    </Suspense>
  )
}

async function Suspended() {
  const data = await getRestaurants(true)

  return <DataTable columns={columns} data={data} />
}
