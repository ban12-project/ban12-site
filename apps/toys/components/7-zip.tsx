'use client'

import {
  ChangeEventHandler,
  ReactEventHandler,
  useCallback,
  useRef,
  useState,
} from 'react'
import Script from 'next/script'
import { useGSAP } from '@gsap/react'
import { useDrop } from 'ahooks'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { Loader2 } from 'lucide-react'

import { useSaveFile } from '#/hooks/use-save-file'

import { Button } from './ui/button'

gsap.registerPlugin(Flip)

interface JS7z {
  /** https://emscripten.org/docs/api_reference/Filesystem-API.html */
  FS: {
    mkdir: (path: string) => void
    writeFile: (path: string, data: string | ArrayBufferView) => void
    readdir: (path: string) => string[]
    readFile: (path: string, options?: { encoding: 'binary' }) => Uint8Array
  }

  onExit: (exitCode: number) => void
  /**
   * Command Line Version User's Guide https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/
   */
  callMain: (
    params: [
      Command: 'a' | 'b' | 'd' | 'e' | 'l' | 't' | 'u' | 'x',
      ...args: string[],
    ],
  ) => void
}

declare global {
  interface Window {
    JS7z: () => Promise<JS7z>
  }
}

type Out = { filename: string; blob: Blob }

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
}

function use7Zip() {
  const [pending, setPending] = useState(false)
  const [js7z, setJS7z] = useState<JS7z | null>(null)
  const inputFilesRef = useRef<File[]>([])
  const outputFilesRef = useRef<Out[]>([])

  const resolve = async (files: File[]) => {
    if (!js7z) {
      inputFilesRef.current = files
      return
    }

    setPending(true)

    const isExtract =
      files.length === 1 &&
      [
        ...supportedFormats.packingAndUnpacking,
        ...supportedFormats.onlyUnpacking,
      ].some((format) =>
        files[0].name.toUpperCase().endsWith(`.${format.toUpperCase()}`),
      )

    if (isExtract) {
      await extract(files)
    } else {
      await compress(files)
    }
    inputFilesRef.current.length = 0

    setPending(false)
  }

  const initJS7z = useCallback(async () => {
    setPending(true)
    const js7z = await window.JS7z()
    setJS7z(js7z)
    if (inputFilesRef.current.length !== 0) await resolve(inputFilesRef.current)
    setPending(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLoad = () => {
    initJS7z().catch(console.error)
  }

  /**
   * https://github.com/GMH-Code/JS7z?tab=readme-ov-file#technical-info-multi-start-safety-in-emscripten-projects
   */
  const reset = useCallback(() => {
    initJS7z().catch(console.error)
  }, [initJS7z])

  const compress = useCallback(
    async (files: File[]) => {
      if (!js7z) return

      // Create the input folder
      js7z.FS.mkdir('/in')

      // Write each file into the input folder
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        js7z.FS.writeFile('/in/' + file.name, new Uint8Array(arrayBuffer))
      }

      const promise = new Promise<Out>((resolve, reject) => {
        js7z.onExit = function (exitCode) {
          // Compression unsuccessful
          if (exitCode !== 0)
            return reject(new Error(`7zip exit code: ${exitCode}`))

          const buffer = js7z.FS.readFile('/out/archive.zip')
          const data: Out = {
            filename: 'archive.zip',
            blob: new Blob([buffer], { type: 'application/octet-stream' }),
          }
          outputFilesRef.current = [data]
          reset()

          resolve(data)
        }
      })

      js7z.callMain(['a', '/out/archive.zip', '/in/*'])

      return promise
    },
    [js7z, reset],
  )

  const extract = useCallback(
    async (files: File[]) => {
      if (!js7z) return

      // Create the input folder
      js7z.FS.mkdir('/in')

      // Write each file into the input folder
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        js7z.FS.writeFile('/in/' + file.name, new Uint8Array(arrayBuffer))
      }

      const promise = new Promise<Out[]>((resolve, reject) => {
        js7z.onExit = function (exitCode) {
          // Compression unsuccessful
          if (exitCode !== 0)
            return reject(new Error(`7zip exit code: ${exitCode}`))

          const out: Out[] = []
          const files = js7z.FS.readdir('/out')
          for (const file of files) {
            // Skip the current and parent directory entries
            if (file !== '.' && file !== '..') {
              const buffer = js7z.FS.readFile('/out/' + file)
              out.push({
                filename: file,
                blob: new Blob([buffer], { type: 'application/octet-stream' }),
              })
            }
          }
          outputFilesRef.current = out
          reset()

          resolve(out)
        }
      })

      js7z.callMain(['e', '/in/*', '-o/out'])

      return promise
    },
    [js7z, reset],
  )

  const benchmark = useCallback(() => {
    if (!js7z) return

    js7z.callMain(['b'])
  }, [js7z])

  return { pending, js7z, onLoad, outputFilesRef, compress, benchmark, resolve }
}

export default function SevenZip() {
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  // const q = gsap.utils.selector(formRef)

  const { pending, onLoad, outputFilesRef, resolve } = use7Zip()

  // @ts-expect-error - supported in fact, may be type missing
  useDrop(() => window, {
    onFiles: resolve,
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
  })

  const { isSupportShowSaveFilePicker, saveFile } = useSaveFile()

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files
    if (!files) return
    void resolve(Array.from(files))
  }

  const onSubmit: ReactEventHandler = (e) => {
    e.preventDefault()

    if (outputFilesRef.current.length === 0) {
      return inputRef.current?.click()
    }

    void saveFile(outputFilesRef.current)
  }

  // useGSAP(() => {
  //   const state = Flip.getState(q('button'))
  //   const timeline = Flip.from(state, {
  //     absolute: true,
  //     ease: 'power1.inOut',
  //     targets: q('button'),
  //     scale: true,
  //     simple: true,
  //     onEnter: (elements) => {
  //       return gsap.fromTo(
  //         elements,
  //         {
  //           opacity: 0,
  //           scale: 0,
  //         },
  //         {
  //           opacity: 1,
  //           scale: 1,
  //           delay: 0.2,
  //           duration: 0.3,
  //         },
  //       )
  //     },
  //     onLeave: (elements) => {
  //       return gsap.to(elements, {
  //         opacity: 0,
  //         scale: 0,
  //       })
  //     },
  //     /* onComplete() {
  //       // works around a Safari rendering bug (unrelated to GSAP). Things reflow narrower otherwise.
  //       let boxes = document.querySelector(".boxes"),
  //         lastChild = boxes.lastChild;
  //       boxes.appendChild(lastChild);
  //     } */
  //   })
  // }, [])

  return (
    <>
      <form
        onSubmit={onSubmit}
        ref={formRef}
        className="flex h-[calc(100vh-var(--layout-header-height))] items-center justify-center"
      >
        <input
          className="sr-only"
          type="file"
          multiple
          ref={inputRef}
          onChange={onChange}
        />
        <Button disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {outputFilesRef.current.length !== 0
            ? 'Save'
            : 'Select files to continue'}
        </Button>
      </form>
      <Script src="/js7z-mt-fs-2.3.0/js7z.js" onLoad={onLoad} />
    </>
  )
}
