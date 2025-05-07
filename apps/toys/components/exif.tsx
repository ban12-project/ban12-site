'use client'

import { ChangeEventHandler } from 'react'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { parseMetadata } from '@uswriting/exiftool'
import { toast } from 'sonner'

export default function Exif() {
  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) throw new Error('File is required')

    const id = toast.promise(parseMetadata(file), {
      duration: Infinity,
      loading: 'Loading...',
      success: ({ success, data, error }) => {
        if (success) {
          return data
        } else {
          toast.error(`Error: ${error}`, {
            id,
          })
        }
      },
      error: (err) => {
        return err
      },
      cancel: {
        label: 'Cancel',
        onClick: () => console.log('Cancel!'),
      },
    }) as number
  }

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" onChange={handleFileChange} />
    </div>
  )
}
