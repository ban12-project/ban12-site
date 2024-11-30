'use client'

import { useActionState } from 'react'

import type { LocalizedString, SelectAlbum } from '#/lib/db/schema'
import { LocalizedHelper } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { createAlbum, updateAlbum } from '../../actions'

type Props = {
  fields?:
    | SelectAlbum
    | (Pick<SelectAlbum, 'collectionId'> & {
        id?: undefined
        title: string
        description: string
      })
}

const localizedHelper = new LocalizedHelper()

export default function Form({
  fields = {
    title: '',
    description: '',
    collectionId: NaN,
  },
}: Props) {
  const isCreating = !fields?.id

  const handleAction = (prevState: string | undefined, formData: FormData) => {
    if (!isCreating) {
      const title = localizedHelper.resolveFormData(formData, 'title')
      formData.append('title', JSON.stringify(title))
      const description = localizedHelper.resolveFormData(
        formData,
        'description',
      )
      formData.append('description', JSON.stringify(description))
    }

    return isCreating
      ? createAlbum(prevState, formData)
      : updateAlbum(prevState, formData)
  }
  const [errorMessage, dispatch, pending] = useActionState(
    handleAction,
    undefined,
  )

  return (
    <form action={dispatch} className="grid gap-4 py-4">
      {Object.entries(fields).map(([key, value]) =>
        !isCreating && ['title', 'description'].includes(key) ? (
          localizedHelper.render(
            key,
            value as LocalizedString,
            (key, value, name) => (
              <FormItem key={name} name={name} value={value} />
            ),
          )
        ) : (
          <FormItem key={key} name={key} value={value as string} />
        ),
      )}

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

function FormItem({
  name,
  value,
}: {
  name: string
  value: string | number | null
}) {
  return (
    <div className="grid grid-cols-4 items-center gap-4" key={name}>
      <Label htmlFor="name" className="text-right">
        {name}
      </Label>
      <Input
        defaultValue={value?.toString()}
        className="col-span-3"
        name={name}
        type={name === 'collectionId' ? 'number' : 'text'}
      />
    </div>
  )
}
