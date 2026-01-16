import { Link } from '@repo/i18n/client';
import { Button } from '@repo/ui/components/button';
import { type Columns, DashboardTable } from '#/components/dashboard-table';
import { getAlbums } from '#/lib/db/queries';
import type { SelectAlbum } from '#/lib/db/schema';
import { LocalizedHelper } from '#/lib/utils';

import { deleteAlbum } from '../../actions';

const localizedHelper = new LocalizedHelper();

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
    cell: (album) =>
      localizedHelper.render('', album.title, (key, value) => (
        <p>{`${key}: ${value}`}</p>
      )),
  },
  {
    key: 'description',
    header: 'description',
    cell: (album) =>
      localizedHelper.render('', album.description, (key, value) => (
        <p>{`${key}: ${value}`}</p>
      )),
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
        {/* @ts-expect-error - TODO FIX */}
        <form action={deleteAlbum}>
          <input defaultValue={album.id} className="hidden" name="id" />
          <Button variant="link">del</Button>
        </form>
      </>
    ),
    className: 'sticky right-0 text-right',
  },
];

export default async function AlbumPage() {
  const albums = await getAlbums();

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
  );
}
