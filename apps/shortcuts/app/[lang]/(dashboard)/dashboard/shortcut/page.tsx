import { Link } from '@repo/i18n/client'
import type { SelectShortcut } from '#/drizzle/schema'

import { Button } from '#/components/ui/button'
import { Columns, DashboardTable } from '#/components/dashboard-table'

import { deleteShortcut, getShortcuts } from '../../actions'

const shortcutsTableColumns: Columns<SelectShortcut> = [
  {
    key: 'uuid',
    header: 'uuid',
    cell: (shortcut) => shortcut.uuid,
    className: 'sticky left-0',
  },
  {
    key: 'createdAt',
    header: 'createdAt',
    cell: (shortcut) => shortcut.createdAt.toString(),
  },
  {
    key: 'updatedAt',
    header: 'updatedAt',
    cell: (shortcut) => shortcut.updatedAt.toString(),
  },
  {
    key: 'icloud',
    header: 'icloud',
    cell: (shortcut) => shortcut.icloud,
  },
  {
    key: 'name',
    header: 'name',
    cell: (shortcut) => shortcut.name,
  },
  {
    key: 'description',
    header: 'description',
    cell: (shortcut) => shortcut.description,
  },
  {
    key: 'icon',
    header: 'icon',
    cell: (shortcut) => shortcut.icon,
  },
  {
    key: 'backgroundColor',
    header: 'backgroundColor',
    cell: (shortcut) => shortcut.backgroundColor,
  },
  {
    key: 'details',
    header: 'details',
    cell: (shortcut) => shortcut.details,
  },
  {
    key: 'language',
    header: 'language',
    cell: (shortcut) => shortcut.language,
  },
  {
    key: 'collectionId',
    header: 'collectionId',
    cell: (shortcut) => shortcut.collectionId,
    className: 'sticky right-20',
  },
  {
    key: 'albumId',
    header: 'albumId',
    cell: (shortcut) => shortcut.albumId,
    className: 'sticky right-10',
  },
  {
    key: 'custom',
    header: 'actions',
    cell: (shortcut) => (
      <>
        <Link href={`/dashboard/shortcut/${shortcut.uuid}`}>edit</Link>
        <form action={deleteShortcut}>
          <input defaultValue={shortcut.uuid} className="hidden" name="id" />
          <Button variant="link">del</Button>
        </form>
      </>
    ),
    className: 'sticky right-0 text-right',
  },
]

export default async function ShortcutsPage() {
  const shortcuts = await getShortcuts()

  return (
    <>
      <div>total: {shortcuts.length}</div>
      <DashboardTable columns={shortcutsTableColumns} data={shortcuts} />
    </>
  )
}
