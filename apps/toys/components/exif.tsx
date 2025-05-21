'use client'

import { ChangeEventHandler, useCallback } from 'react'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { parseMetadata } from '@uswriting/exiftool'
import { toast } from 'sonner'
import { useDragDrop } from '#/hooks/use-drag-drop'

export default function Exif() {
  const callback = useCallback((files: File[]) => {
    files.forEach(process)
  }, [])
  
  useDragDrop(() => window, callback)

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) throw new Error('File is required')
    process(file)
  }

  const process = (file: File) => {
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
    <div className="flex justify-center items-center min-h-screen">
      <form className="max-w-sm">
        <Label htmlFor="file" className='mb-2'>Select a file</Label>
        <Input id="file" type="file" onChange={handleFileChange} />
      </form>
    </div>
  )
}
