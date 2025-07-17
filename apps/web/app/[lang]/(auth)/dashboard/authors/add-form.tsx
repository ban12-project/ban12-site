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
  DialogTrigger,
} from '@repo/ui/components/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form'
import { Input } from '@repo/ui/components/input'
import { LoaderCircleIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { addAuthor } from '../../actions'

const initialState = { message: '', errors: {} }
const formSchema = z.object({
  platform: z.enum(['bilibili']),
  platformId: z.string().nonempty(),
})

export default function AddForm() {
  const [open, setOpen] = React.useState(false)
  const [state, action, pending] = React.useActionState(addAuthor, initialState)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      platform: 'bilibili',
      platformId: '',
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
    toast.success('Author added successfully')
  }, [form, setOpen, state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <form action={action}>
          <DialogTrigger asChild>
            <Button variant="outline">Add</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Author</DialogTitle>
              <DialogDescription>
                Add a new author to the database.
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <Input placeholder="platform" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platformId"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>Platform ID</FormLabel>
                  <FormControl>
                    <Input placeholder="platform id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  )
}
