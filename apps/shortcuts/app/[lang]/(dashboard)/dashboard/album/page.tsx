import { Link } from '@repo/i18n/client'
import type { SelectAlbum } from '#/drizzle/schema'

import { deleteAlbum, getAlbums } from '#/lib/actions'
import { Button } from '#/components/ui/button'
import { Columns, DashboardTable } from '#/components/dashboard-table'

const albumsTableColumns: Columns<SelectAlbum> = [
  {
    key: 'id',
    header: 'id',
    cell: (album) => album.id,
    className: 'sticky left-0',
  },
  {
    key: 'title',
    header: 'title',
    cell: (album) => album.title,
  },
  {
    key: 'description',
    header: 'description',
    cell: (album) => album.description,
  },
  {
    key: 'collectionId',
    header: 'collectionId',
    cell: (album) => album.collectionId,
  },
  {
    key: 'createdAt',
    header: 'createdAt',
    cell: (album) => album.createdAt,
  },
  {
    key: 'updatedAt',
    header: 'updatedAt',
    cell: (album) => album.updatedAt,
  },
  {
    key: 'custom',
    header: 'actions',
    cell: (album) => (
      <>
        <Link href={`/dashboard/album/${album.id}`}>edit</Link>
        <form action={deleteAlbum}>
          <input defaultValue={album.id} className="hidden" name="id" />
          <Button variant="link">del</Button>
        </form>
      </>
    ),
    className: 'sticky right-0 text-right',
  },
]

export default async function AlbumPage() {
  const albums = await getAlbums()

  return (
    <>
      <div>
        <Link className="mr-2" href={`/dashboard/album/create`}>
          Create
        </Link>
        total: {albums.length}
      </div>
      <DashboardTable columns={albumsTableColumns} data={albums} />
    </>
  )
}
