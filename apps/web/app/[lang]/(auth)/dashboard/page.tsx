import { getRestaurants } from '#/lib/db/queries'

import { columns } from './columns'
import { DataTable } from './data-table'

export default async function DashboardPage() {
  const data = await getRestaurants()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
