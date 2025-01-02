import { Link } from '@repo/i18n/client'

import { getShortcuts } from '#/lib/db/queries'
import type { SelectShortcut } from '#/lib/db/schema'
import { LocalizedHelper, negativeToHexColor } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Columns, DashboardTable } from '#/components/dashboard-table'

import { deleteShortcut } from '../../actions'

export const runtime = 'edge'

const localizedHelper = new LocalizedHelper()

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
    cell: (shortcut) =>
      localizedHelper.render('', shortcut.name, (key, value) => (
        <p>{`${key}: ${value}`}</p>
      )),
  },
  {
    key: 'description',
    header: 'description',
    cell: (shortcut) =>
      localizedHelper.render('', shortcut.description, (key, value) => (
        <p>{`${key}: ${value}`}</p>
      )),
  },
  /* {
    key: 'icon',
    header: 'icon',
    cell: (shortcut) => shortcut.icon,
  }, */
  {
    key: 'backgroundColor',
    header: 'backgroundColor',
    cell: (shortcut) => (
      <span
        className="inline-block size-5 rounded-full bg-[var(--background-color,#ef4444)]"
        style={
          {
            '--background-color': shortcut.backgroundColor
              ? negativeToHexColor(shortcut.backgroundColor)
              : '',
          } as React.CSSProperties
        }
        title={shortcut.backgroundColor || ''}
      ></span>
    ),
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
        {/* @ts-expect-error - TODO FIX */}
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
