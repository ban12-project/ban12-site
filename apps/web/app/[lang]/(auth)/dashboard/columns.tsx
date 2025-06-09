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
import { Input } from '@repo/ui/components/input'
import { ColumnDef } from '@tanstack/react-table'
import { LoaderCircleIcon, MoreHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type { SelectRestaurant } from '#/lib/db/schema'

import { updateYoutubeLink, videoUnderstanding } from '../actions'

export const columns: ColumnDef<SelectRestaurant>[] = [
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
    accessorKey: 'youtube',
    header: 'Youtube link',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'actions',
    cell: ({ row }) => <Actions row={row.original} />,
  },
]

function Actions({ row }: { row: SelectRestaurant }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!row.youtube || row.status === 'processing') return
    startTransition(async () => {
      const text = await videoUnderstanding(row.youtube!)
      console.log(text)
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
          <DropdownMenuItem disabled={isPending} onClick={() => handleClick()}>
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

            <input type="hidden" name="bvid" value={row.bvid} />

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
