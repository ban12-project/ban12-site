'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@repo/ui/components/hover-card'
import { Input } from '@repo/ui/components/input'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, LoaderCircleIcon, MoreHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import type { SelectPost, SelectPostsToRestaurants } from '#/lib/db/schema'

import { linkPostToNewRestaurant, linkPostToRestaurant } from '../../actions'

type Row = SelectPost & { postsToRestaurants: SelectPostsToRestaurants | null }

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

export const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'authorId',
    header: 'Author ID',
  },
  {
    accessorKey: 'postsToRestaurants.restaurantId',
    header: 'restaurant ID',
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
      ).toLocaleString('zh-Hans-CN', {
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
    accessorKey: 'metadata.length',
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
    accessorKey: 'created_at',
    header: 'Created At',
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
    header: 'Metadata',
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="sm">
            View Metadata
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="max-h-[50dvh] w-[50dvw] overflow-auto">
          <pre>{JSON.stringify(row.original.metadata, null, 2)}</pre>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <Actions row={row.original} />,
  },
]

function Actions({ row }: { row: Row }) {
  const [dialogActive, setDialogActive] =
    React.useState<'linkRestaurant'>('linkRestaurant')
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {row.postsToRestaurants === null && (
            <DropdownMenuItem asChild>
              <LinkNewRestaurantForm row={row} />
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => {
              setOpen(true)
              setDialogActive('linkRestaurant')
            }}
          >
            link restaurant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-md">
        {dialogActive === 'linkRestaurant' && (
          <LinkRestaurantForm row={row} setOpen={setOpen} />
        )}
      </DialogContent>
    </Dialog>
  )
}

const initialState = { message: '', errors: {} }

function LinkNewRestaurantForm({ row }: { row: Row }) {
  const [state, action, pending] = React.useActionState(
    linkPostToNewRestaurant,
    initialState,
  )

  React.useEffect(() => {
    if (state.message) {
      toast.error(state.message)
    }
  }, [state.message])

  return (
    <form action={action}>
      <Button
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-disabled={pending}
      >
        link new restaurant
      </Button>
      <input type="hidden" name="postId" value={row.id} />
    </form>
  )
}

const formSchema = z.object({
  postId: z.string().min(1, 'Post ID is required'),
  restaurantId: z.string().min(1, 'Restaurant ID is required'),
})

function LinkRestaurantForm({
  row,
  setOpen,
}: {
  row: Row
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [state, action, pending] = React.useActionState(
    linkPostToRestaurant,
    initialState,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postId: row.id.toString(),
      restaurantId: '',
    },
  })

  const onSubmit: React.ReactEventHandler<
    React.ComponentRef<'button'>
  > = async (e) => {
    e.preventDefault()

    const currentTarget = e.currentTarget

    const isValid = await form.trigger()
    if (!isValid) return

    currentTarget.form?.requestSubmit()
  }

  React.useEffect(() => {
    if (state.message !== 'success') return

    form.reset()
    setOpen(false)
  }, [form, setOpen, state.message])

  return (
    <Form {...form}>
      <form action={action}>
        <DialogHeader>
          <DialogTitle>link restaurant</DialogTitle>
          <DialogDescription>{row.id}</DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="restaurantId"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage>
                {state.message !== 'success' ? state.message : ''}
              </FormMessage>
            </FormItem>
          )}
        />

        <input type="hidden" name="postId" value={row.id} />

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button
            disabled={pending}
            aria-disabled={pending}
            type="submit"
            variant="primary"
            className="sm:ml-auto"
            onClick={onSubmit}
          >
            Submit
            {pending && <LoaderCircleIcon className="animate-spin" />}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
