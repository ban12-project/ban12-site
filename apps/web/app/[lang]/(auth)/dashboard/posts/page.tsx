import { getPosts } from '#/lib/db/queries'

import { DataTable } from '../data-table'
import { columns } from './columns'
import Filter from './filter'

export default async function PostsPage() {
  const data = await getPosts()

  return <DataTable columns={columns} data={data} header={Filter} />
}
