'use client'

import { useActionState } from 'react'
import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'

import type { LocalizedString, SelectShortcut } from '#/lib/db/schema'
import { LocalizedHelper } from '#/lib/utils'
import { updateShortcut } from '#/app/[lang]/(dashboard)/actions'

type Props = {
  shortcut: SelectShortcut
}

const localizedHelper = new LocalizedHelper()

export default function EditForm({ shortcut }: Props) {
  const [errorMessage, dispatch, pending] = useActionState(
    (prevState: string | undefined, formData: FormData) => {
      const name = localizedHelper.resolveFormData(formData, 'name')
      formData.append('name', JSON.stringify(name))
      const description = localizedHelper.resolveFormData(
        formData,
        'description',
      )
      formData.append('description', JSON.stringify(description))

      return updateShortcut(prevState, formData)
    },
    undefined,
  )

  return (
    <form action={dispatch} className="grid gap-4 py-4">
      {Object.entries(shortcut).map(([key, value]) =>
        ['name', 'description'].includes(key) ? (
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

function FormItem({ name, value }: { name: string; value: string | number }) {
  return (
    <div className="grid grid-cols-4 items-center gap-4" key={name}>
      <Label htmlFor="name" className="text-right">
        {name}
      </Label>
      <Input
        defaultValue={value?.toString()}
        className="col-span-3"
        name={name}
      />
    </div>
  )
}
