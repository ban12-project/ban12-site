'use client'

import { startTransition, useActionState, useState, useTransition } from 'react'
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
  DialogTrigger,
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
import { z } from 'zod'

import type { SelectRestaurant } from '#/lib/db/schema'

import { updateYoutubeLink, videoUnderstanding } from '../actions'

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

export const columns: ColumnDef<SelectRestaurant>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    accessorKey: 'created',
    header: 'Created',
    cell: ({ row }) =>
      new Date(+row.original.created.toString().padEnd(13, '0')).toLocaleString(
        undefined,
        {
          year: 'numeric',
          month: 'numeric', // Or '2-digit' for MM
          day: 'numeric', // Or '2-digit' for DD
          hour: '2-digit', // Ensures HH format
          minute: '2-digit', // Ensures mm format
          second: '2-digit', // Ensures ss format
          hour12: false, // This is key for 24-hour format
        },
      ),
  },
  {
    accessorKey: 'bvid',
    header: 'Bilibili bvid',
    cell: ({ row }) => (
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://www.bilibili.com/video/${row.original.bvid}`}
      >
        {row.original.bvid}
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
      const a = parseLengthToSeconds(rowA.original.length)
      const b = parseLengthToSeconds(rowB.original.length)
      return a - b
    },
  },
  {
    accessorKey: 'youtube',
    header: 'Youtube link',
    cell: ({ row }) =>
      row.original.ai_summarize ? (
        <HoverCard>
          <HoverCardTrigger asChild>
            <a target="_blank" rel="noreferrer" href={row.original.youtube!}>
              {row.original.youtube}
            </a>
          </HoverCardTrigger>
          <HoverCardContent className="w-[50dvw] overflow-auto">
            <h4 className="text-sm font-semibold mb-2">AI Summarize:</h4>
            <pre>{JSON.stringify(row.original.ai_summarize, null, 2)}</pre>
          </HoverCardContent>
        </HoverCard>
      ) : (
        row.original.youtube && (
          <a target="_blank" rel="noreferrer" href={row.original.youtube}>
            {row.original.youtube}
          </a>
        )
      ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated at',
    cell: ({ row }) =>
      row.original.updated_at.toLocaleString(undefined, {
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
    id: 'actions',
    cell: ({ row }) => <Actions row={row.original} />,
  },
]

function Actions({ row }: { row: SelectRestaurant }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!row.youtube) return toast.error('No youtube link')
    if (row.status === 'processing') return toast.info('Processing')
    startTransition(async () => {
      await new Promise<void>((resolve) => {
        toast.promise(
          videoUnderstanding({
            fileUri: row.youtube!,
            id: row.id,
          }),
          {
            loading: 'Processing',
            success: () => {
              return `${row.title} AI summarize done`
            },
            error: 'Error',
            finally: resolve,
          },
        )
      })
    })
  }

  return (
    <LinkYoutubeDialog row={row}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DialogTrigger asChild>
            <DropdownMenuItem>link youtube</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem
            disabled={isPending}
            aria-disabled={isPending}
            onClick={() => handleClick()}
          >
            video understanding
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View customer</DropdownMenuItem>
          <DropdownMenuItem>View payment details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </LinkYoutubeDialog>
  )
}

const formSchema = z.object({
  link: z
    .string()
    .url()
    .startsWith('https://www.youtube.com/watch?v=', 'invalid youtube link'),
})

const initialState = { message: '', errors: {} }

function LinkYoutubeDialog({
  children,
  row,
}: {
  children?: React.ReactNode
  row: SelectRestaurant
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(
    updateYoutubeLink,
    initialState,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: '',
    },
  })

  const onSubmit: React.ReactEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const currentTarget = e.currentTarget

    const isValid = await form.trigger()
    if (!isValid) return

    startTransition(async () => {
      await action(new FormData(currentTarget))
      form.reset()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form action={action} onSubmit={onSubmit}>
            <DialogHeader>
              <DialogTitle>Youtube link</DialogTitle>
              <DialogDescription>{row.title}</DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="link"
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

            <input type="hidden" name="id" value={row.id} />

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
              >
                Submit
                {pending && <LoaderCircleIcon className="animate-spin" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
