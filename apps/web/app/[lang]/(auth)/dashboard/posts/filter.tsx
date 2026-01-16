'use client';

import { Input } from '@repo/ui/components/input';
import type { Table } from '@tanstack/react-table';

export default function Filter<T>({ table }: { table: Table<T> }) {
  'use no memo';

  return (
    <Input
      placeholder="Filter title..."
      value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
      onChange={(event) =>
        table.getColumn('title')?.setFilterValue(event.target.value)
      }
      className="max-w-sm"
    />
  );
}
