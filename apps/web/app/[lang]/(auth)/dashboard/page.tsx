import { getRestaurants } from '#/lib/db/queries'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function DashboardPage() {
  const data = await getRestaurants(true)

  return <DataTable columns={columns} data={data} />
}
