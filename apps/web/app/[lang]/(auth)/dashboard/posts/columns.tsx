'use client'

import { Button } from '@repo/ui/components/button'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown } from 'lucide-react'

import type { SelectPost } from '#/lib/db/schema'

const parseLengthToSeconds = (lengthStr: string | undefined | null): number => {
  if (!lengthStr || typeof lengthStr !== 'string') return 0
  const parts = lengthStr.split(':').map(Number)
  let seconds = 0
  if (parts.some(isNaN)) return 0 // Handle cases like "N/A" or malformed strings

  if (parts.length === 1) {
    // ss
    seconds = parts[0]
  } else if (parts.length === 2) {
    // mm:ss
    seconds = parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // hh:mm:ss
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else {
    return 0 // Invalid format
  }
  return seconds
}

export const columns: ColumnDef<SelectPost>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'authorId',
    header: 'Author ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => row.original.metadata.title,
  },
  {
    accessorKey: 'created',
    header: 'Created',
    cell: ({ row }) =>
      new Date(
        +row.original.metadata.created.toString().padEnd(13, '0'),
      ).toLocaleString(undefined, {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'numeric', // Or '2-digit' for MM
        day: 'numeric', // Or '2-digit' for DD
        hour: '2-digit', // Ensures HH format
        minute: '2-digit', // Ensures mm format
        second: '2-digit', // Ensures ss format
        hour12: false, // This is key for 24-hour format
      }),
  },
  {
    accessorKey: 'bvid',
    header: 'Bilibili bvid',
    cell: ({ row }) => (
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.bilibili.com/video/${row.original.metadata.bvid}`}
      >
        {row.original.metadata.bvid}
      </a>
    ),
  },
  {
    accessorKey: 'length',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Length
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    sortingFn: (rowA, rowB) => {
      const a = parseLengthToSeconds(rowA.original.metadata.length)
      const b = parseLengthToSeconds(rowB.original.metadata.length)
      return a - b
    },
  },
  {
    header: 'Metadata',
    cell: ({ row }) => JSON.stringify(row.original.metadata, null, 2),
  },
]
