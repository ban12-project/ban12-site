import { useCallback, useEffect, useRef, useState } from 'react'

interface JS7z {
  /** https://emscripten.org/docs/api_reference/Filesystem-API.html */
  FS: {
    mkdir: (path: string) => void
    writeFile: (path: string, data: string | ArrayBufferView) => void
    readdir: (path: string) => string[]
    readFile: (path: string, options?: { encoding: 'binary' }) => Uint8Array
  }

  print: (text: string) => void
  printErr: (text: string) => void
  onAbort: (reason: string) => void
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
    JS7z: ({
      print,
      printErr,
      onAbort,
      onExit,
    }?: Partial<
      Pick<JS7z, 'print' | 'printErr' | 'onAbort' | 'onExit'>
    >) => Promise<JS7z>
  }

  interface GlobalEventHandlersEventMap {
    print: CustomEvent<FlatArray<Parameters<JS7z['print']>, 1>>
    printErr: CustomEvent<FlatArray<Parameters<JS7z['printErr']>, 1>>
    onAbort: CustomEvent<FlatArray<Parameters<JS7z['onAbort']>, 1>>
    onExit: CustomEvent<FlatArray<Parameters<JS7z['onExit']>, 1>>
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

export function useSevenZip() {
  const [pending, setPending] = useState(false)
  const [js7z, setJS7z] = useState<JS7z | null>(null)
  const inputFilesRef = useRef<File[]>([])
  const outputFilesRef = useRef<Out[]>([])

  const initJS7z = useCallback(async () => {
    setPending(true)

    const js7z = await window.JS7z({
      print: createCustomEvent('print'),
      printErr: createCustomEvent('printErr'),
      onAbort: createCustomEvent('onAbort'),
      onExit: createCustomEvent('onExit'),
    })

    setJS7z(js7z)
    if (inputFilesRef.current.length !== 0) await resolve(inputFilesRef.current)

    setPending(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        window.addEventListener('onExit', (e) => {
          const exitCode = e.detail
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
        })
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
        window.addEventListener('onExit', (e) => {
          const exitCode = e.detail
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
        })
      })

      js7z.callMain(['e', '/in/*', '-o/out'])

      return promise
    },
    [js7z, reset],
  )

  const onLoad = () => {
    initJS7z().catch(console.error)
  }

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

  const benchmark = useCallback(() => {
    if (!js7z) return

    js7z.callMain(['b'])
  }, [js7z])

  return { pending, onLoad, outputFilesRef, compress, benchmark, resolve }
}

function createCustomEvent(name: string) {
  return function (
    detail: FlatArray<
      Parameters<
        JS7z['print'] | JS7z['printErr'] | JS7z['onAbort'] | JS7z['onExit']
      >,
      1
    >,
  ) {
    const event = new CustomEvent(name, { detail })
    window.dispatchEvent(event)
  }
}

export function useExtractProgressFromStdout() {
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

  const onAbort = useCallback(() => setProgress(0), [])
  const onExit = useCallback((e: { detail: number }) => {
    setProgress(e.detail !== 0 ? 0 : 100)
  }, [])

  useEffect(() => {
    window.addEventListener('print', onPrint)
    window.addEventListener('onAbort', onAbort)
    window.addEventListener('onExit', onExit)

    return () => {
      window.removeEventListener('print', onPrint)
      window.removeEventListener('onAbort', onAbort)
      window.removeEventListener('onExit', onExit)
    }
  }, [onAbort, onExit, onPrint])

  return progress
}
