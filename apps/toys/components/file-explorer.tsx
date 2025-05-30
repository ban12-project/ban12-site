'use client'

import { useCallback, useState } from 'react'
import { useResponsive } from '@repo/ui/hooks/use-responsive'

import type { Messages } from '#/lib/i18n'
import List from '#/components/virtual-list'

import FileCard from './file-card'
import FileForm from './file-form'

interface FileExplorerProps {
  messages: Messages
}

export type Append = (file: File) => void
export type FileItem = Pick<File, 'name' | 'type' | 'size' | 'lastModified'> &
  Omit<MessageResult, 'index'>
type MessageResult = {
  sha256?: string
  progress: number
  time: number
}

const queue: {
  file: File
  callback: (data: MessageResult) => void
}[] = []
const workers: Worker[] = []
const runWorker = (worker: Worker, id: number) => {
  if (!queue.length) {
    workers.splice(id, 1)
    worker.terminate()
    return
  }

  const { file, callback } = queue.shift()!
  worker.onmessage = (event: MessageEvent<MessageResult>) => {
    callback(event.data)

    if (event.data.progress !== 1) return
    if (queue.length) runWorker(worker, id)
    else {
      workers.splice(id, 1)
      worker.terminate()
    }
  }

  worker.onerror = (err) => {
    // Add error handling
    console.error(`Worker ${id} error:`, err)
    callback({ progress: -1, time: 0 }) // Indicate error state
    if (queue.length)
      runWorker(worker, id) // Try next item
    else {
      workers.splice(id, 1)
      // No terminate here? Let's keep the worker for potential reuse or terminate explicitly.
      // Depending on error type, maybe terminate.
    }
  }

  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target && event.target.result instanceof ArrayBuffer) {
      worker.postMessage(
        {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: event.target.result,
        },
        { transfer: [event.target.result] },
      )
    } else {
      // Handle the error appropriately, e.g., log it or inform the user
      console.error('Failed to read file as ArrayBuffer')
      callback({ progress: -1, time: 0 }) // Indicate error state
    }
  }
  reader.onerror = () => callback({ progress: -1, time: 0 })
  reader.readAsArrayBuffer(file)
}

const createWorker = (file: File, callback: (data: MessageResult) => void) => {
  queue.push({ file, callback })
  if (workers.length < (navigator.hardwareConcurrency || 4)) {
    const worker = new Worker(
      new URL('#/lib/calculate-hash-worker.ts', import.meta.url),
    )
    workers.push(worker)
    runWorker(worker, workers.length - 1)
  } else {
    // Optional: If queue gets large and all workers are busy, maybe start a worker anyway
    // or find the least busy worker if tracking is implemented.
    // For now, just queueing is fine. The first free worker will pick it up.
  }
}

export default function FileExplorer({ messages }: FileExplorerProps) {
  const [list, setList] = useState<FileItem[]>([])

  const append: Append = useCallback((file) => {
    const item = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      progress: 0,
      time: 0,
    }
    setList((currentList) => {
      const index = currentList.length // The index for the new item

      createWorker(file, (props: MessageResult) => {
        setList((listToUpdate) => {
          // Make sure the item still exists at that index before updating
          // (e.g., it wasn't removed)
          if (index < listToUpdate.length) {
            const currentItem = listToUpdate[index]
            const updatedItem = { ...currentItem, ...props }
            return listToUpdate.toSpliced(index, 1, updatedItem)
          }

          // If index is out of bounds, log warning and return unchanged list
          console.warn(`Item at index ${index} not found for worker update.`)
          return listToUpdate
        })
      })
      return [...currentList, item]
    })
  }, [])

  const { breakpoints: isDesktop } = useResponsive(
    (breakpoint) => breakpoint.md,
  )

  return (
    <main className="mx-auto flex min-h-dvh max-w-7xl flex-col px-5">
      <FileForm append={append} />
      <div className="mt-10 flex-1">
        <List data={list} itemSize={isDesktop ? 160 : 300}>
          {FileCard}
        </List>
      </div>
    </main>
  )
}
