'use client'

import React, {
  startTransition,
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@repo/ui/components/badge'
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
import { Switch } from '@repo/ui/components/switch'
import { ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  CircleCheck,
  CircleDot,
  CircleX,
  LoaderCircleIcon,
  MoreHorizontal,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import type { SelectRestaurant } from '#/lib/db/schema'

import {
  startVideoUnderstanding,
  updateInvisible,
  updateLocation,
  updateYoutubeLink,
} from '../actions'
import UploadToGeminiFiles from './upload-to-gemini-files'

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
          timeZone: 'Asia/Shanghai',
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
    cell: ({ row }) => (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge
            variant={
              row.original.status === 'pending'
                ? 'outline'
                : row.original.status === 'processing'
                  ? 'secondary'
                  : row.original.status === 'success'
                    ? 'default'
                    : 'destructive'
            }
          >
            {row.original.status === 'pending' ? (
              <CircleDot />
            ) : row.original.status === 'processing' ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : row.original.status === 'success' ? (
              <CircleCheck className="fill-green-500 dark:fill-green-400" />
            ) : (
              <CircleX className="fill-red-500 dark:fill-red-400" />
            )}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={row.original.youtube!}
            >
              {row.original.youtube}
            </a>
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-[50dvw] overflow-auto">
          <h4 className="mb-2 text-sm font-semibold">AI Summarize:</h4>
          <pre>{JSON.stringify(row.original.ai_summarize, null, 2)}</pre>
        </HoverCardContent>
      </HoverCard>
    ),
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => row.original.location?.join(', '),
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
    accessorKey: 'invisible',
    header: 'Invisible',
    cell: ({ row }) => <InvisibleForm row={row.original} />,
  },
  {
    id: 'actions',
    cell: ({ row }) => <Actions row={row.original} />,
  },
]

function Actions({ row }: { row: SelectRestaurant }) {
  const [dialogActive, setDialogActive] = useState<
    'linkYoutube' | 'location' | 'upload-to-gemini-files'
  >('linkYoutube')
  const [isPending, startTransition] = useTransition()

  const resolveYoutubeLink = () => {
    if (!row.youtube) return toast.error('No youtube link')
    if (row.status === 'processing') return toast.info('Processing')
    startTransition(async () => {
      await new Promise<void>((resolve) => {
        toast.promise(
          startVideoUnderstanding({
            fileUri: row.youtube!,
            id: row.id,
          }),
          {
            loading: 'Processing',
            success: () => {
              return `${row.title} already start processing`
            },
            error: 'Error',
            finally: resolve,
          },
        )
      })
    })
  }

  const [open, setOpen] = useState(false)

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
          <DropdownMenuItem
            onClick={() => {
              setOpen(true)
              setDialogActive('linkYoutube')
            }}
          >
            link youtube
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            aria-disabled={isPending}
            onClick={resolveYoutubeLink}
          >
            video understanding
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpen(true)
              setDialogActive('location')
            }}
          >
            latitude and longitude
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setOpen(true)
              setDialogActive('upload-to-gemini-files')
            }}
          >
            upload video to gemini files
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="sm:max-w-md">
        {dialogActive === 'linkYoutube' && (
          <LinkYoutubeForm row={row} setOpen={setOpen} />
        )}
        {dialogActive === 'location' && (
          <LocationForm row={row} setOpen={setOpen} />
        )}
        {dialogActive === 'upload-to-gemini-files' && (
          <UploadToGeminiFiles row={row} setOpen={setOpen} />
        )}
      </DialogContent>
    </Dialog>
  )
}

const formSchema = z.object({
  link: z
    .string()
    .url()
    .startsWith('https://www.youtube.com/watch?v=', 'invalid youtube link'),
})

const initialState = { message: '', errors: {} }

function LinkYoutubeForm({
  row,
  setOpen,
}: {
  row: SelectRestaurant
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [state, action, pending] = useActionState(
    updateYoutubeLink,
    initialState,
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: row.youtube || '',
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

  useEffect(() => {
    if (state.message !== 'success') return

    form.reset()
    setOpen(false)
  }, [form, setOpen, state.message])

  return (
    <Form {...form}>
      <form action={action}>
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

const locationSchema = z.object({
  location: z.tuple([z.string().nonempty(), z.string().nonempty()]),
})

function LocationForm({
  row,
  setOpen,
}: {
  row: SelectRestaurant
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [state, action, pending] = useActionState(updateLocation, initialState)

  const form = useForm<z.infer<typeof locationSchema>>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      location: (row.location?.map(String) as [string, string]) || ['', ''],
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

  useEffect(() => {
    if (state.message !== 'success') return
    form.reset()
    setOpen(false)
  }, [form, setOpen, state])

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    if (text.indexOf(',') === -1) return
    const strings = text.split(',')
    if (strings.length !== 2) return
    const location = strings.toSorted((a, b) => Number(b) - Number(a)) as [
      string,
      string,
    ]
    form.setValue('location', location)
  }

  return (
    <Form {...form}>
      <form action={action}>
        <DialogHeader>
          <DialogTitle>Latitude and Longitude</DialogTitle>
          <DialogDescription>{row.title}</DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="location.1"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input placeholder="latitude" {...field} onPaste={onPaste} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location.0"
          render={({ field }) => (
            <FormItem className="my-2">
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input placeholder="longitude" {...field} onPaste={onPaste} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <input type="hidden" name="id" value={row.id} />

        <FormMessage>
          {state.message !== 'success' ? state.message : ''}
        </FormMessage>

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

function InvisibleForm({ row }: { row: SelectRestaurant }) {
  const ref = useRef<React.ComponentRef<'form'>>(null)
  const [invisible, setInvisible] = useState(row.invisible)
  const [optimisticInvisible, setOptimisticInvisible] = useOptimistic(invisible)
  const [state, action, pending] = useActionState(updateInvisible, initialState)

  const onCheckedChange = (checked: boolean) => {
    startTransition(() => {
      setOptimisticInvisible(checked)
    })
    ref.current?.requestSubmit()
  }

  useEffect(() => {
    if (state.message !== 'success') return
    setInvisible(optimisticInvisible)
  }, [optimisticInvisible, state])

  return (
    <form action={action} ref={ref}>
      <Switch
        name="invisible"
        value="true" // send to server action only checked
        defaultChecked={optimisticInvisible}
        onCheckedChange={onCheckedChange}
        disabled={pending}
        aria-disabled={pending}
      />
      <input type="hidden" name="id" value={row.id} />
    </form>
  )
}
