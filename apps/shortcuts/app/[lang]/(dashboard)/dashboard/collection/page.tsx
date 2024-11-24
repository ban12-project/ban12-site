import { Link } from '@repo/i18n/client'

import { getCollections } from '#/lib/db/queries'
import type { SelectCollection } from '#/lib/db/schema'
import { Button } from '#/components/ui/button'
import { Columns, DashboardTable } from '#/components/dashboard-table'

import { deleteCollection } from '../../actions'

const collectionsTableColumns: Columns<SelectCollection> = [
  {
    key: 'id',
    header: 'id',
    cell: (collection) => collection.id,
    className: 'sticky left-0',
  },
  {
    key: 'title',
    header: 'title',
    cell: (collection) => collection.title,
  },
  {
    key: 'image',
    header: 'image',
    cell: (collection) => collection.image,
    className: 'w-24',
  },
  {
    key: 'textColor',
    header: 'textColor',
    cell: (collection) => (
      <span
        className="block h-6 w-6 rounded-full bg-[var(--color,#fff)] shadow"
        style={{ '--color': collection.textColor } as React.CSSProperties}
      ></span>
    ),
  },
  {
    key: 'custom',
    header: 'actions',
    cell: (collection) => (
      <>
        <Link href={`/dashboard/collection/${collection.id}`}>edit</Link>
        <form action={deleteCollection}>
          <input defaultValue={collection.id} className="hidden" name="id" />
          <Button variant="link">del</Button>
        </form>
      </>
    ),
    className: 'sticky right-0 text-right',
  },
]

export default async function CollectionPage() {
  const collections = await getCollections()

  return (
    <>
      <div>
        <Link className="mr-2" href={`/dashboard/collection/create`}>
          Create
        </Link>
        total: {collections.length}
      </div>
      <DashboardTable columns={collectionsTableColumns} data={collections} />
    </>
  )
}
