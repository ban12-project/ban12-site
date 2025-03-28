'use client'

import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/components/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const FormSchema = z.object({
  email: z
    .string({
      required_error: 'Please select an email to display.',
    })
    .email(),
})

const supportedDataTypes = [
  { 'data-type': 'URL', action: 'Open URL in browser or an app' },
  { 'data-type': 'Location', action: 'Open location in Maps' },
  { 'data-type': 'Message', action: 'Compose a message in Messages' },
  { 'data-type': 'Email', action: 'Compose an email in Mail' },
  { 'data-type': 'Phone number', action: 'Call the phone number' },
  { 'data-type': 'Contact', action: 'Add to Contacts' },
  { 'data-type': 'Event', action: 'Add event to Calendar' },
  { 'data-type': 'WiFi Configuration', action: 'Join a WiFi network' },
]

const QRCodeForm = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedDataTypes.map((item) => (
                    <SelectItem
                      key={item['data-type']}
                      value={item['data-type']}
                    >
                      {item.action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                You can manage email addresses in your{' '}
                <Link href="/examples/forms">email settings</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

QRCodeForm.displayName = 'QRCodeForm'

export { QRCodeForm, supportedDataTypes }
