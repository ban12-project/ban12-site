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
    id: 'created_at',
    cell: ({ row }) =>
      row.original.created_at.toLocaleString('zh-Hans-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated at',
    id: 'updated_at',
    cell: ({ row }) =>
      row.original.updated_at.toLocaleString('zh-Hans-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
  },
]
