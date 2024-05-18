'use client'

import type { shortcut } from '@prisma/client'
import { useFormState, useFormStatus } from 'react-dom'

import { updateShortcut } from '#/lib/actions'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'

type Props = {
  shortcut: shortcut
}

export default function EditForm({ shortcut }: Props) {
  const [errorMessage, dispatch] = useFormState(updateShortcut, undefined)

  return (
    <form action={dispatch} className="grid gap-4 py-4">
      {Object.entries(shortcut).map(([key, value]) => (
        <div className="grid grid-cols-4 items-center gap-4" key={key}>
          <Label htmlFor="name" className="text-right">
            {key}
          </Label>
          <Input
            defaultValue={value?.toString()}
            className="col-span-3"
            name={key}
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

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return <Button disabled={pending}>Submit</Button>
}
