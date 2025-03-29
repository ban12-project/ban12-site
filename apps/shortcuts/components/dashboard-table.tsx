import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { cn } from '@repo/ui/lib/utils'

export type Columns<T> = {
  key: (keyof T extends string ? keyof T : never) | 'custom'
  header: ((item: T, colIndex: number) => React.ReactNode) | string
  cell: (item: T, colIndex: number, rowIndex: number) => React.ReactNode
  className?: string
}[]

export function DashboardTable<T extends Record<string, unknown>>({
  columns,
  data,
}: {
  columns: Columns<T>
  data: T[]
}) {
  return (
    <Table className="overscroll-x-contain [&_.sticky]:bg-white">
      <TableHeader className="sticky top-0 z-10 bg-white dark:bg-black">
        <TableRow>
          {columns.map((col, colIndex) => (
            <TableHead
              key={col.key}
              className={cn(col.className, 'capitalize')}
            >
              {typeof col.header === 'string'
                ? col.header
                : col.header(data[colIndex], colIndex)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, rowIndex) => (
          <TableRow key={item.id as string}>
            {columns.map((col, colIndex) => (
              <TableCell key={col.key} className={col.className}>
                {col.cell(item, colIndex, rowIndex)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
