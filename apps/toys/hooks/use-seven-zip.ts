import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  MainToWorkerMessage,
  Out,
  OutType,
  WorkerToMainMessage,
} from '#/lib/7-zip-types'
import { IN_BROWSER } from '#/lib/utils'

/** @see https://www.7-zip.org/ */
export const supportedFormats = {
  packingAndUnpacking: ['7z', 'XZ', 'BZIP2', 'GZIP', 'TAR', 'ZIP', 'WIM'],
  onlyUnpacking: [
    'APFS',
    'AR',
    'ARJ',
    'CAB',
    'CHM',
    'CPIO',
    'CramFS',
    'DMG',
    'EXT',
    'FAT',
    'GPT',
    'HFS',
    'IHEX',
    'ISO',
    'LZH',
    'LZMA',
    'MBR',
    'MSI',
    'NSIS',
    'NTFS',
    'QCOW2',
    'RAR',
    'RPM',
    'SquashFS',
    'UDF',
    'UEFI',
    'VDI',
    'VHD',
    'VHDX',
    'VMDK',
    'XAR',
    'Z',
  ],
} as const

export type Format = (typeof supportedFormats.packingAndUnpacking)[number]

let worker: Worker | null = null

function createWorker(): Worker {
  // @ts-expect-error - only used in browser
  if (!IN_BROWSER) return null
  worker ||= new Worker(new URL('#/lib/7-zip-worker.ts', import.meta.url))
  return worker
}

export function useSevenZip() {
  const [pending, setPending] = useState(false)
  const outputFilesRef = useRef<Out[]>([])
  const workerRef = useRef<Worker>(createWorker())

  const reset = useCallback(() => {
    workerRef.current.terminate()
    worker = null
    workerRef.current = createWorker()
    setPending(false)
  }, [])

  const resolve = (files: File[], format: Format) => {
    if (pending) return
    setPending(true)

    workerRef.current.addEventListener(
      'message',
      ({ data }: MessageEvent<WorkerToMainMessage>) => {
        if (data.type !== OutType.File) return

        outputFilesRef.current = data.payload
        reset()
      },
    )

    const isExtract =
      files.length === 1 &&
      [
        ...supportedFormats.packingAndUnpacking,
        ...supportedFormats.onlyUnpacking,
      ].some((format) =>
        files[0].name.toUpperCase().endsWith(`.${format.toUpperCase()}`),
      )

    sendMessageToWorker({
      call: isExtract
        ? ['e', '/in/*', '-o/out']
        : ['a', `/out/archive.${format.toLowerCase()}`, '/in/*'],
      payload: files,
    })
  }

  const sendMessageToWorker = useCallback((data: MainToWorkerMessage) => {
    workerRef.current.postMessage(data)
  }, [])

  const benchmark = useCallback(() => {
    sendMessageToWorker({ call: ['b'] })
  }, [sendMessageToWorker])

  useTotalToast(workerRef.current)
  useLogPrint(workerRef.current)
  const progress = useExtractProgressFromStdout(workerRef.current)

  return { pending, outputFilesRef, benchmark, resolve, progress }
}

function useExtractProgressFromStdout(worker: Worker) {
  const [progress, setProgress] = useState(0)

  const onPrint = useCallback(({ data }: MessageEvent<WorkerToMainMessage>) => {
    if (data.type !== OutType.Print) return

    const progressMatch = data.payload.match(/(\d+)%/)
    if (progressMatch) {
      const progress = parseInt(progressMatch[1], 10)
      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        setProgress(progress)
      }
    }
  }, [])

  const onAbort = useCallback(({ data }: MessageEvent<WorkerToMainMessage>) => {
    if (data.type !== OutType.onAbort) return
    setProgress(0)
  }, [])

  const onExit = useCallback(({ data }: MessageEvent<WorkerToMainMessage>) => {
    if (data.type !== OutType.onExit) return
    setProgress(data.payload !== 0 ? 0 : 100)
  }, [])

  useEffect(() => {
    worker.addEventListener('message', onPrint)
    worker.addEventListener('message', onAbort)
    worker.addEventListener('message', onExit)

    return () => {
      worker.removeEventListener('message', onPrint)
      worker.removeEventListener('message', onAbort)
      worker.removeEventListener('message', onExit)
    }
  }, [onAbort, onExit, onPrint, worker])

  return progress
}

function useLogPrint(worker: Worker) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const onPrint = ({ data }: MessageEvent<WorkerToMainMessage>) => {
      if (data.type !== OutType.Print) return
      console.log(data.payload)
    }

    worker.addEventListener('message', onPrint)

    return () => {
      worker.removeEventListener('message', onPrint)
    }
  }, [worker])
}

export function useTotalToast(worker: Worker) {
  const info = useRef({
    in: { number: 0, size: '' },
    out: { number: 0, size: '' },
  })

  useEffect(() => {
    const total = ({ data }: MessageEvent<WorkerToMainMessage>) => {
      if (data.type !== OutType.Print) return
      const text = data.payload

      // 2 files, 1609920 bytes (1573 KiB)
      // 1 file, 91237 bytes (90 KiB)
      const inMatch = text.match(/(\d+) files?, \d+ bytes \((\d+ [A-Z]iB)\)/)
      if (inMatch) {
        const number = parseInt(inMatch[1], 10)
        const size = inMatch[2]
        info.current.in = { number, size }
      }

      // Files: 2
      // Size:       165356
      // Archive size: 888101 bytes (868 KiB)
      const outMatch = text.match(
        /Files: (\d+)|Size:\s+(\d+)|Archive size: \d+ bytes \((\d+ [A-Z]iB)\)/,
      )
      if (outMatch) {
        const number = parseInt(outMatch[1], 10) || info.current.out.number || 1
        const size = outMatch[2]
          ? parseInt(outMatch[2], 10) + ' bytes'
          : outMatch[3]
        info.current.out = { number, size }
      }
    }

    const showToast = ({ data }: MessageEvent<WorkerToMainMessage>) => {
      if (data.type !== OutType.onExit) return

      toast('task completed', {
        description: `In: ${info.current.in.number} files, ${info.current.in.size}, Out: ${info.current.out.number} files, ${info.current.out.size}`,
        duration: Infinity,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      })
    }

    worker.addEventListener('message', total)
    worker.addEventListener('message', showToast)

    return () => {
      worker.removeEventListener('message', total)
      worker.removeEventListener('message', showToast)
    }
  }, [worker])
}
