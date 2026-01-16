import { Suspense } from 'react';

import { getAuthors } from '#/lib/db/queries';

import { DataTable } from '../data-table';
import AddForm from './add-form.tsx';
import { columns } from './columns';

export default function AuthorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Suspended />
    </Suspense>
  );
}

async function Suspended() {
  const data = await getAuthors();

  return (
    <DataTable
      columns={columns}
      data={data}
      header={AddForm}
      defaultSorting={[{ id: 'created_at', desc: true }]}
    />
  );
}
