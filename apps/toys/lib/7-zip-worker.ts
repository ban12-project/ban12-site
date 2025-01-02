import {
  MainToWorkerMessage,
  Out,
  OutType,
  WorkerToMainMessage,
} from './7-zip-types'

importScripts('/js7z-mt-fs-2.3.0/js7z.js')

interface JS7z extends EmscriptenModule {
  /** https://emscripten.org/docs/api_reference/Filesystem-API.html */
  FS: typeof FS

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

const js7z = await self.JS7z({
  print: createCustomEvent('print'),
  printErr: createCustomEvent('printErr'),
  onAbort: createCustomEvent('onAbort'),
  onExit: createCustomEvent('onExit'),
})

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
    self.dispatchEvent(event)
  }
}

async function compressAndExtract(
  command: MainToWorkerMessage['call'],
  files: File[],
) {
  // Create the input folder
  js7z.FS.mkdir('/in')

  // Write each file into the input folder
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer()
    js7z.FS.writeFile('/in/' + file.name, new Uint8Array(arrayBuffer))
  }

  const promise = new Promise<Out[]>((resolve, reject) => {
    self.addEventListener('onExit', (e) => {
      const exitCode = e.detail
      // Compression unsuccessful
      if (exitCode !== 0)
        reject(Error(`7Zip failed with exit code ${exitCode}`))

      const out: Out[] = []
      const files = js7z.FS.readdir('/out')
      for (const file of files) {
        // Skip the current and parent directory entries
        if (file === '.' || file === '..') continue

        const buffer = js7z.FS.readFile('/out/' + file)
        out.push({
          filename: file,
          blob: new Blob([buffer], { type: 'application/octet-stream' }),
        })
      }

      resolve(out)
    })
  })

  js7z.callMain(command)

  return promise
}

self.addEventListener(
  'message',
  async (event: MessageEvent<MainToWorkerMessage>) => {
    const { call, payload } = event.data

    const result = ['a', 'e'].includes(call[0])
      ? await compressAndExtract(call, payload!)
      : js7z.callMain(call)

    if (result) sendMessage({ type: OutType.File, payload: result })
  },
)

self.addEventListener('print', (e: { detail: string }) => {
  sendMessage({ type: OutType.Print, payload: e.detail })
})

self.addEventListener('printErr', (e: { detail: string }) => {
  sendMessage({ type: OutType.printErr, payload: e.detail })
})

self.addEventListener('onAbort', (e: { detail: string }) => {
  sendMessage({ type: OutType.onAbort, payload: e.detail })
})

self.addEventListener('onExit', (e: { detail: number }) => {
  sendMessage({ type: OutType.onExit, payload: e.detail })
})

function sendMessage(message: WorkerToMainMessage) {
  self.postMessage(message)
}
