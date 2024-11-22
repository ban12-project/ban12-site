'use client'

import { useActionState } from 'react'
import type { SelectAlbum } from '#/drizzle/schema'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

import { createAlbum, updateAlbum } from '../../actions'

type Props = {
  fields?: Partial<SelectAlbum>
}

export default function Form({ fields }: Props) {
  const [errorMessage, dispatch, pending] = useActionState(
    fields ? updateAlbum : createAlbum,
    undefined,
  )
  fields = fields || {
    title: '',
    description: '',
    collectionId: NaN,
  }

  return (
    <form action={dispatch} className="grid gap-4 py-4">
      {Object.entries(fields).map(([key, value]) => (
        <div className="grid grid-cols-4 items-center gap-4" key={key}>
          <Label htmlFor="name" className="text-right">
            {key}
          </Label>
          <Input
            defaultValue={value?.toString()}
            className="col-span-3"
            name={key}
            type={key === 'collectionId' ? 'number' : 'text'}
          />
        </div>
      ))}

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
