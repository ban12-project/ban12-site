'use client'

import React, { useActionState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale } from '@repo/i18n/client'
import type { Messages } from '#/lib/i18n'
import { Loader2 } from 'lucide-react'
import { createPortal, useFormStatus } from 'react-dom'
import { useForm, useFormContext } from 'react-hook-form'
import * as z from 'zod'

import { postShortcut } from '#/lib/actions'
import { RecordType } from '#/lib/shortcut'
import { IN_BROWSER } from '#/lib/utils'
import { Button } from '#/components/ui/button'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { PAGE_DRAWER_HEADER_ID } from './page-drawer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'

interface ShortcutPostProps {
  messages: Messages
}

const icloudSchema = z.object({
  icloud: z
    .string()
    .url()
    .startsWith(
      'https://www.icloud.com/shortcuts/',
      'must be start with https://www.icloud.com/shortcuts/',
    )
    .regex(/\/[0-9a-f]{32}\/?$/, 'iCloud url is broken'),
})

const shortcutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().nullable(),
  backgroundColor: z.string(),
  details: z
    .array(
      z.enum([
        'SHARE_SHEET',
        'APPLE_WATCH',
        'MENU_BAR_ON_MAC',
        'QUICK_ACTIONS_ON_MAC',
        'RECEIVES_SCREEN',
      ]),
    )
    .nullable(),
  language: z.enum(['zh-CN', 'en']),
})

const formSchema = z.intersection(icloudSchema, shortcutSchema)

export type FormSchemaType = z.infer<typeof formSchema>

export interface FormHandler {
  submit: () => void
}

const details = [
  {
    label: '',
    value: ['SHARE_SHEET'],
  },
  {
    label: 'Apple Watch',
    value: ['APPLE_WATCH'],
  },
  {
    label: 'Mac',
    value: ['MENU_BAR_ON_MAC', 'RECEIVES_SCREEN', 'QUICK_ACTIONS_ON_MAC'],
  },
] as const

const SubmitButton = function SubmitButton({
  messages,
}: {
  messages: Messages
}) {
  const { pending } = useFormStatus()
  const { formState, getValues } = useFormContext<FormSchemaType>()
  const innerButtonRef = useRef<React.ComponentRef<'button'>>(null)

  const container = IN_BROWSER
    ? document.querySelector(`#${PAGE_DRAWER_HEADER_ID}`)
    : null

  const innerButton = (
    <button
      ref={innerButtonRef}
      type="submit"
      className="sr-only"
      aria-disabled={pending}
    >
      Submit
    </button>
  )

  if (!container) return innerButton

  const isDone = getValues('icloud').length > 0 && !formState.dirtyFields.icloud

  return (
    <>
      {createPortal(
        <Button
          variant="ios"
          size="auto"
          disabled={pending}
          onClick={() => innerButtonRef.current?.click()}
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isDone ? messages.common.done : messages.common.next}
        </Button>,
        container,
      )}
      {innerButton}
    </>
  )
}

const initialState = { message: '', errors: {} }

export default function ShortcutPost({ messages }: ShortcutPostProps) {
  const { locale } = useLocale()

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icloud: '',
      name: '',
      description: '',
      icon: '',
      backgroundColor: '',
      details: [],
      language: locale as FormSchemaType['language'],
    },
  })

  const [state, dispatch] = useActionState(postShortcut, initialState)
  const otherFieldsVisibility =
    !!state.data && !form.formState.dirtyFields.icloud

  // there need client-side validation but
  // like this handle server actions progressive enhancement will be disabled
  // progressive enhancement: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#behavior
  // react-hook-form related issue: https://github.com/react-hook-form/react-hook-form/issues/10391
  const handleAction = async (formData: FormData) => {
    // undefined means triggers validation on all fields.
    const isValid = await form.trigger(
      otherFieldsVisibility ? undefined : 'icloud',
    )
    if (!isValid) return

    if (otherFieldsVisibility) {
      formData.append(
        'backgroundColor',
        state.data.fields.icon_color.value.toString(),
      )

      if (state.data.recordType === RecordType.SharedShortcut) {
        formData.append('icon', state.data.fields.icon.value.downloadURL)
      }
    }

    dispatch(formData)
  }

  useEffect(() => {
    if (state.message)
      return form.setError('icloud', { message: state.message })

    if (!state.data) return

    // for check isDirty
    form.resetField('icloud', { defaultValue: form.getValues().icloud })

    // fill the form with data from icloud
    form.setValue('name', state.data.fields.name.value)

    if (state.data.recordType === RecordType.GalleryShortcut) {
      form.setValue('description', state.data.fields.longDescription.value)
      form.setValue(
        'language',
        state.data.fields.language.value.replace(
          '_',
          '-',
        ) as FormSchemaType['language'],
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <Form {...form}>
      <form
        action={handleAction}
        className="p-safe-max-4 flex-1 space-y-8 overflow-y-auto"
      >
        <FormField
          control={form.control}
          name="icloud"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  variant="ios"
                  autoComplete="off"
                  placeholder={messages['icloud-link']}
                  {...field}
                />
              </FormControl>
              <FormDescription className="px-3">
                {messages['share-through-icloud']}
                <a
                  className="ml-1 text-blue-500 active:text-blue-500/80"
                  href="https://support.apple.com/guide/shortcuts/share-shortcuts-apdf01f8c054/ios"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {messages['share-on-iphone-or-ipad']}
                </a>
                <a
                  className="ml-1 text-blue-500 active:text-blue-500/80"
                  href="https://support.apple.com/guide/shortcuts-mac/share-shortcuts-apdf01f8c054/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {messages['share-on-mac']}
                </a>
              </FormDescription>
              <FormMessage className="px-3" />
            </FormItem>
          )}
        />

        {otherFieldsVisibility && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="animate-slideUpAndFade">
                <FormControl>
                  <Input
                    variant="ios"
                    autoComplete="off"
                    placeholder={messages['form-name']}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-3" />
              </FormItem>
            )}
          />
        )}

        {otherFieldsVisibility && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="animate-slideUpAndFade">
                <FormControl>
                  <Textarea
                    placeholder={messages['form-description']}
                    className="resize-none"
                    variant="ios"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="px-3" />
              </FormItem>
            )}
          />
        )}

        {/* {details.map((item) => (
          <FormField
            key={item.label}
            control={form.control}
            name="details"
            render={() => (
              <FormItem className="px-3">
                {item.label && <FormDescription>{item.label}</FormDescription>}
                {item.value.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem key={item}>
                        <div className="flex items-center justify-between">
                          <FormLabel>{messages.details[item]}</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value.includes(item)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value.filter(
                                        (value) => value !== item,
                                      ),
                                    )
                              }}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
                <FormMessage className="px-3" />
              </FormItem>
            )}
          />
        ))} */}

        {otherFieldsVisibility && (
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem className="animate-slideUpAndFade">
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  name={field.name}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="zh-CN">zh-CN</SelectItem>
                    <SelectItem value="en">en</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="px-3">
                  {messages['form-language']}({messages.common.optional})
                </FormDescription>
                <FormMessage className="px-3" />
              </FormItem>
            )}
          />
        )}

        <SubmitButton messages={messages} />
      </form>
    </Form>
  )
}
