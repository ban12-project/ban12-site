'use client'

import { useActionState } from 'react'
import { toast } from 'sonner'

import type { LocalizedString, SelectCollection } from '#/lib/db/schema'
import { LocalizedHelper } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { createCollection, updateCollection } from '../../actions'

const localizedHelper = new LocalizedHelper()

type Props = {
  fields?:
    | Partial<SelectCollection>
    | (Pick<SelectCollection, 'image' | 'textColor'> & {
        title: string
        id?: undefined
      })
}

export default function Form({
  fields = {
    title: '',
    image: '',
    textColor: '',
  },
}: Props) {
  const isCreating = !fields.id

  const handleAction = async (
    prevState: string | undefined,
    formData: FormData,
  ) => {
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

    if (!isCreating) {
      const title = localizedHelper.resolveFormData(formData, 'title')
      formData.append('title', JSON.stringify(title))
    }

    return isCreating
      ? createCollection(prevState, formData)
      : updateCollection(prevState, formData)
  }

  const [errorMessage, dispatch, pending] = useActionState(
    handleAction,
    undefined,
  )

  return (
    <form action={dispatch} className="grid gap-4 py-4">
      {!isCreating && (
        <Input defaultValue={fields.id} className="hidden" name="id" />
      )}

      {isCreating ? (
        <div className="grid grid-cols-4 items-center gap-4" key="title">
          <Label htmlFor="name" className="text-right">
            title
          </Label>
          <Input
            defaultValue={fields.title as string}
            className="col-span-3"
            name="title"
          />
        </div>
      ) : (
        localizedHelper.render(
          'title',
          fields.title as LocalizedString,
          (key, value, name) => (
            <div className="grid grid-cols-4 items-center gap-4" key="title">
              <Label htmlFor="name" className="text-right">
                title
              </Label>
              <Input defaultValue={value} className="col-span-3" name={name} />
            </div>
          ),
        )
      )}

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
