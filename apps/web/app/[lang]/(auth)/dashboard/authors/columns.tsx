'use client'

import { ColumnDef } from '@tanstack/react-table'

import type { SelectAuthor } from '#/lib/db/schema'

export const columns: ColumnDef<SelectAuthor>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'platform',
    header: 'Platform',
  },
  {
    accessorKey: 'platformId',
    header: 'Platform ID',
  },
  {
    accessorKey: 'created_at',
    header: 'Created at',
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated at',
  },
]
