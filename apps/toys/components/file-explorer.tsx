'use client'

import { useRef, useState } from 'react'

import type { Messages } from '#/lib/i18n'
import { useResponsive } from '#/hooks/use-responsive'
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

  worker.postMessage(file)
  return worker
}

const createWorker = (file: File, callback: (data: MessageResult) => void) => {
  queue.push({ file, callback })
  if (workers.length < (navigator.hardwareConcurrency || 4)) {
    const worker = runWorker(
      new Worker(new URL('#/lib/calculate-hash-worker.ts', import.meta.url)),
      workers.length,
    )
    workers.push(worker)
  }
}

export default function FileExplorer({ messages }: FileExplorerProps) {
  const [list, setList] = useState<FileItem[]>([])
  const fileIndex = useRef(list.length)

  const append: Append = (file) => {
    const item = {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      progress: 0,
      time: 0,
    }
    setList((list) => list.concat(item))
    const index = fileIndex.current++
    createWorker(file, (props: MessageResult) => {
      setList((list) => list.toSpliced(index, 1, { ...list[index], ...props }))
    })
  }

  const isDesktop = useResponsive((breakpoint) => breakpoint.md)

  return (
    <main className="mx-auto max-w-7xl px-5">
      <FileForm append={append} />
      <div className="mt-10 h-[calc(100vh-var(--layout-header-height)-100px-40px)] md:h-[50vh]">
        <List data={list} itemSize={isDesktop ? 160 : 300}>
          {FileCard}
        </List>
      </div>
    </main>
  )
}
