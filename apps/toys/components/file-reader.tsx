'use client'

import { useEffect } from 'react'

import { reader } from '#/lib/exif'

export default function FileReader() {
  useEffect(() => {
    const onDrop = (e: DragEvent) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault()

      if (!e.dataTransfer) return

      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile()
            if (!file) return
            reader(file)
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          reader(e.dataTransfer.files[i])
        }
      }
    }

    window.addEventListener('drop', onDrop)

    return () => {
      window.removeEventListener('drop', onDrop)
    }
  }, [])

  const onSubmit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (let i = 0, len = files.length; i < len; i++) reader(files[i])
  }

  return (
    <form>
      <label
        htmlFor="file"
        className="text-grayA10 flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-4 border-dotted border-blue-400 p-2 hover:border-orange-500 data-[drag-over=true]:border-orange-500"
      >
        Drag one or multi files to this page ...
      </label>
      <input
        className="sr-only"
        type="file"
        name="file"
        id="file"
        onChange={onSubmit}
      />
    </form>
  )
}
