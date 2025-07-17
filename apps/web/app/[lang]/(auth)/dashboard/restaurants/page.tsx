import { Suspense } from 'react'

import { getRestaurants } from '#/lib/db/queries'

import { DataTable } from '../data-table'
import { columns } from './columns'

export default function RestaurantsPage() {
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
