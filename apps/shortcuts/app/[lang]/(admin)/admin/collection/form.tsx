'use client'

import type { collection } from '@prisma/client'
import { useFormState, useFormStatus } from 'react-dom'
import { toast } from 'sonner'

import { createCollection, updateCollection } from '#/lib/actions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

type Props = {
  fields?: Partial<collection>
}

export default function Form({ fields }: Props) {
  const isCreating = !fields?.id

  const [errorMessage, dispatch] = useFormState(
    !isCreating ? updateCollection : createCollection,
    undefined,
  )
  fields = fields || {
    title: '',
    image: '',
  }

  /* const handleAction = async (formData: FormData) => {
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

    const { url, fields } = await response.json()

    const fileFormData = new FormData()
    Object.entries(fields).forEach(([key, value]) => {
      fileFormData.append(key, value as string)
    })
    fileFormData.append('file', file)

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: fileFormData,
    })

    if (!uploadResponse.ok) {
      toast('Upload failed.')
      throw new Error('S3 Upload Error: ' + uploadResponse)
    }

    console.log(JSON.stringify(uploadResponse, null, 2))

    await dispatch(formData)
  } */

  return (
    <form action={dispatch} className="grid gap-4 py-4">
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
          defaultValue={fields.image}
          className="col-span-3"
          name="image"
          type="file"
          accept="image/*"
        />
      </div>

      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return <Button disabled={pending}>Submit</Button>
}
