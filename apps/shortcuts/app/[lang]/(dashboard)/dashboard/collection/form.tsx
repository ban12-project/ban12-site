'use client'

import { useActionState } from 'react'
import type { SelectCollection } from '#/lib/db/schema'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { createCollection, updateCollection } from '../../actions'

type Props = {
  fields?: Partial<SelectCollection>
}

export default function Form({ fields }: Props) {
  const isCreating = !fields?.id

  const [errorMessage, dispatch, pending] = useActionState(
    !isCreating ? updateCollection : createCollection,
    undefined,
  )
  fields = fields || {
    title: '',
    image: '',
    textColor: '',
  }

  const handleAction = async (formData: FormData) => {
    const file = formData.get('image') as File

    const response = await fetch(
      new URL('/api/upload', process.env.NEXT_PUBLIC_HOST_URL),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      },
    )

    if (!response.ok) {
      toast('Failed to get pre-signed URL.')
      throw new Error('Failed to get pre-signed URL.')
    }

    const { url } = (await response.json()) as { url: string }

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      toast('Upload failed.')
      throw new Error('S3 Upload Error: ' + uploadResponse.status)
    }

    const { pathname } = new URL(url)
    formData.set('image', pathname)

    dispatch(formData)
  }

  return (
    <form action={handleAction} className="grid gap-4 py-4">
      {!isCreating && (
        <Input defaultValue={fields.id} className="hidden" name="id" />
      )}

      <div className="grid grid-cols-4 items-center gap-4" key="title">
        <Label htmlFor="name" className="text-right">
          title
        </Label>
        <Input
          defaultValue={fields.title}
          className="col-span-3"
          name="title"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4" key="image">
        <Label htmlFor="name" className="text-right">
          image
        </Label>
        <Input
          className="col-span-3"
          name="image"
          type="file"
          accept="image/*"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4" key="textColor">
        <Label htmlFor="name" className="text-right">
          textColor
        </Label>
        <Input
          defaultValue={fields.textColor || ''}
          className="col-span-3"
          name="textColor"
        />
      </div>

      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>

      <Button disabled={pending}>Submit</Button>
    </form>
  )
}
