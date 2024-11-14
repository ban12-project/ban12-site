import { ReactEventHandler, useEffect, useRef, useState } from 'react'

import { Append } from './file-explorer'

interface FileFormProps {
  append: Append
}

export default function Form({ append }: FileFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit: ReactEventHandler = (e) => {
    e.preventDefault()
    const files = inputRef.current?.files
    if (!files) return
    for (let i = 0, len = files.length; i < len; i++) append(files[i])
  }

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
            append(file)
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          append(e.dataTransfer.files[i])
        }
      }
      setDragOver(false)
    }

    const onDragOver = (e: DragEvent) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault()
      setDragOver(true)
    }

    const onCancel = () => {
      setDragOver(false)
    }

    window.addEventListener('drop', onDrop)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragend', onCancel)
    window.addEventListener('dragleave', onCancel)

    return () => {
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragend', onCancel)
      window.removeEventListener('dragleave', onCancel)
    }
  }, [append])

  const [dragOver, setDragOver] = useState(false)

  return (
    <form onSubmit={onSubmit} className="h-[100px]">
      <label
        htmlFor="file"
        data-drag-over={dragOver}
        className="text-grayA10 flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-4 border-dotted border-blue-400 p-2  hover:border-orange-500 data-[drag-over=true]:border-orange-500"
      >
        Drag one or multi files to this page ...
      </label>
      <input
        className="sr-only"
        ref={inputRef}
        type="file"
        name="file"
        id="file"
        multiple
        onChange={onSubmit}
      />
      <button className="sr-only">submit</button>
    </form>
  )
}
