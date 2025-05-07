'use client'

import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
} from 'react'
import Script from 'next/script'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/components/button'
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  // FormLabel,
  // FormMessage,
} from '@repo/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { call, JS7zEventName, SCRIPT_LOADED_EVENT, type Out } from '#/lib/7-zip'
import { useDragDrop } from '#/hooks/use-drag-drop'
import { useSaveFile } from '#/hooks/use-save-file'

/** @see https://www.7-zip.org/ */
const supportedFormats = {
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

type Format = (typeof supportedFormats.packingAndUnpacking)[number]

export default function SevenZip() {
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

  return (
    <>
      <FormComponent
        pending={pending}
        outputFilesRef={outputFilesRef}
        resolve={resolve}
        progress={progress}
      />
      <Script
        src="/js7z-mt-fs-ec-2.4.1/js7z.js"
        onLoad={() => {
          const event = new CustomEvent(SCRIPT_LOADED_EVENT)
          window.dispatchEvent(event)
        }}
      />
    </>
  )
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
    window.addEventListener(JS7zEventName.print, onPrint)
    window.addEventListener(JS7zEventName.onAbort, onAbort)
    window.addEventListener(JS7zEventName.onExit, onExit)

    return () => {
      window.removeEventListener(JS7zEventName.print, onPrint)
      window.removeEventListener(JS7zEventName.onAbort, onAbort)
      window.removeEventListener(JS7zEventName.onExit, onExit)
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

    window.addEventListener(JS7zEventName.print, onPrint)

    return () => {
      window.removeEventListener(JS7zEventName.print, onPrint)
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

    window.addEventListener(JS7zEventName.print, total)
    window.addEventListener(JS7zEventName.onExit, showToast)

    return () => {
      window.removeEventListener(JS7zEventName.print, total)
      window.removeEventListener(JS7zEventName.onExit, showToast)
    }
  }, [])
}

const FormSchema = z.object({
  format: z.enum(supportedFormats.packingAndUnpacking, {
    required_error: 'Please select an format to continue.',
  }),
})

function FormComponent({
  pending,
  outputFilesRef,
  resolve,
  progress,
}: {
  pending: boolean
  outputFilesRef: RefObject<Out[]>
  resolve: (files: File[], format: Format) => void
  progress: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const callback = useRef((files: File[]) => {
    resolve(files, format)
  }).current
  const { isHovering } = useDragDrop(() => window, callback)

  const { saveFile } = useSaveFile()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      format: '7z',
    },
  })

  const format = useWatch({ name: 'format', control: form.control })

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files
    if (!files) return
    resolve(Array.from(files), format)
  }

  const onSubmit = async (/* data: z.infer<typeof FormSchema> */) => {
    if (outputFilesRef.current.length === 0) {
      return inputRef.current?.click()
    }

    await saveFile(outputFilesRef.current)

    outputFilesRef.current.length = 0
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        ref={formRef}
        className="flex min-h-dvh items-center justify-center"
        data-drag-over={isHovering}
      >
        <input
          className="sr-only"
          type="file"
          multiple
          ref={inputRef}
          onChange={onChange}
        />

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a format to packing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedFormats.packingAndUnpacking.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {outputFilesRef.current.length !== 0
            ? 'Save'
            : 'Select files to continue'}{' '}
          progress: {progress}
        </Button>
      </form>
    </Form>
  )
}
