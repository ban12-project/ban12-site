export type Out = { filename: string; blob: Blob }

export type MainToWorkerMessage = {
  call: ['a' | 'b' | 'd' | 'e' | 'l' | 't' | 'u' | 'x', ...string[]]
  payload?: {
    a: File[]
    b: never
    d: never
    l: never
    t: never
    u: never
    x: never
    e: File[]
  }[MainToWorkerMessage['call'][0]]
}

export const enum OutType {
  File = 'file',
  Print = 'print',
  printErr = 'printErr',
  onAbort = 'onAbort',
  onExit = 'onExit',
}

export type WorkerToMainMessage = {
  [Type in OutType]: {
    type: Type
    payload: {
      file: Out[]
      print: string
      printErr: string
      onAbort: string
      onExit: number
    }[Type]
  }
}[OutType]
