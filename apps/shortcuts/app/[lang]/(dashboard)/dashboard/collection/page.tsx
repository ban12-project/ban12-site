import { Link } from '@repo/i18n/client'
import { Button } from '@repo/ui/components/button'

import { getCollections } from '#/lib/db/queries'
import type { SelectCollection } from '#/lib/db/schema'
import { LocalizedHelper } from '#/lib/utils'
import { Columns, DashboardTable } from '#/components/dashboard-table'

import { deleteCollection } from '../../actions'

const localizedHelper = new LocalizedHelper()

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
    cell: (collection) =>
      localizedHelper.render('', collection.title, (key, value) => (
        <p>{`${key}: ${value}`}</p>
      )),
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
        className="block h-6 w-6 rounded-full bg-[var(--color,#fff)] shadow-sm"
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
        {/* @ts-expect-error - TODO FIX */}
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
