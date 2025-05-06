import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { call, type Out, OutType } from '#/lib/7-zip'

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

export function useSevenZip() {
  const [pending, setPending] = useState(false)
  const outputFilesRef = useRef<Out[]>([])

  const resolve = async (files: File[], format: Format) => {
    if (pending) return
    setPending(true)

    const isExtract =
      files.length === 1 &&
      [
        ...supportedFormats.packingAndUnpacking,
        ...supportedFormats.onlyUnpacking,
      ].some((format) =>
        files[0].name.toUpperCase().endsWith(`.${format.toUpperCase()}`),
      )

    const result = await call({
      command: isExtract
        ? ['e', '/in/*', '-o/out']
        : ['a', `/out/archive.${format.toLowerCase()}`, '/in/*'],
      payload: files,
    })

    if (result) outputFilesRef.current = result
    setPending(false)
  }

  const benchmark = useCallback(() => {
    call({ command: ['b'] })
  }, [])

  useTotalToast()
  useLogPrint()
  const progress = useExtractProgressFromStdout()

  return { pending, outputFilesRef, benchmark, resolve, progress }
}

function useExtractProgressFromStdout() {
  const [progress, setProgress] = useState(0)

  const onPrint = useCallback((e: { detail: string }) => {
    const progressMatch = e.detail.match(/(\d+)%/)
    if (progressMatch) {
      const progress = parseInt(progressMatch[1], 10)
      if (!isNaN(progress) && progress >= 0 && progress <= 100) {
        setProgress(progress)
      }
    }
  }, [])

  const onAbort = useCallback(() => {
    setProgress(0)
  }, [])

  const onExit = useCallback((e: { detail: number }) => {
    setProgress(e.detail !== 0 ? 0 : 100)
  }, [])

  useEffect(() => {
    window.addEventListener(OutType.Print, onPrint)
    window.addEventListener(OutType.onAbort, onAbort)
    window.addEventListener(OutType.onExit, onExit)

    return () => {
      window.removeEventListener(OutType.Print, onPrint)
      window.removeEventListener(OutType.onAbort, onAbort)
      window.removeEventListener(OutType.onExit, onExit)
    }
  }, [onAbort, onExit, onPrint])

  return progress
}

function useLogPrint() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const onPrint = (e: { detail: string }) => {
      console.log(e.detail)
    }

    window.addEventListener(OutType.Print, onPrint)

    return () => {
      window.removeEventListener(OutType.Print, onPrint)
    }
  }, [])
}

export function useTotalToast() {
  const info = useRef({
    in: { number: 0, size: '' },
    out: { number: 0, size: '' },
  })

  useEffect(() => {
    const total = (e: { detail: string }) => {
      const text = e.detail

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

    const showToast = () => {
      toast('task completed', {
        description: `In: ${info.current.in.number} files, ${info.current.in.size}, Out: ${info.current.out.number} files, ${info.current.out.size}`,
        duration: Infinity,
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo'),
        },
      })
    }

    window.addEventListener(OutType.Print, total)
    window.addEventListener(OutType.onExit, showToast)

    return () => {
      window.removeEventListener(OutType.Print, total)
      window.removeEventListener(OutType.onExit, showToast)
    }
  }, [])
}
