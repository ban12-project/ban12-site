export type Out = { filename: string; blob: Blob };

export type Call = {
  command: ['a' | 'b' | 'd' | 'e' | 'l' | 't' | 'u' | 'x', ...string[]];
  payload?: {
    a: File[];
    b: never;
    d: never;
    l: never;
    t: never;
    u: never;
    x: never;
    e: File[];
  }[Call['command'][0]];
};

export enum JS7zEventName {
  print = 'print',
  printErr = 'printErr',
  onAbort = 'onAbort',
  onExit = 'onExit',
}

interface JS7z extends EmscriptenModule {
  /** https://emscripten.org/docs/api_reference/Filesystem-API.html */
  FS: typeof FS;

  onAbort: (reason: string) => void;
  onExit: (exitCode: number) => void;
  /**
   * Command Line Version User's Guide https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/
   */
  callMain: (
    params: [
      Command: 'a' | 'b' | 'd' | 'e' | 'l' | 't' | 'u' | 'x',
      ...args: string[],
    ],
  ) => void;
}

declare global {
  interface Window {
    JS7z: ({
      print,
      printErr,
      onAbort,
      onExit,
    }?: Partial<Pick<JS7z, JS7zEventName>>) => Promise<JS7z>;
  }

  interface GlobalEventHandlersEventMap {
    print: CustomEvent<FlatArray<Parameters<JS7z[JS7zEventName.print]>, 1>>;
    printErr: CustomEvent<
      FlatArray<Parameters<JS7z[JS7zEventName.printErr]>, 1>
    >;
    onAbort: CustomEvent<FlatArray<Parameters<JS7z[JS7zEventName.onAbort]>, 1>>;
    onExit: CustomEvent<FlatArray<Parameters<JS7z[JS7zEventName.onExit]>, 1>>;
  }
}

function createCustomEvent(name: JS7zEventName) {
  return (
    detail: FlatArray<
      Parameters<
        | JS7z[JS7zEventName.print]
        | JS7z[JS7zEventName.printErr]
        | JS7z[JS7zEventName.onAbort]
        | JS7z[JS7zEventName.onExit]
      >,
      1
    >,
  ) => {
    const event = new CustomEvent(name, { detail });
    self.dispatchEvent(event);
  };
}

export const SCRIPT_LOADED_EVENT = 'SCRIPT_LOADED_EVENT';

export async function call({ command, payload }: Call) {
  if (!window.JS7z) {
    await new Promise<void>((resolve) => {
      const listener = () => {
        resolve();
        window.removeEventListener(SCRIPT_LOADED_EVENT, listener);
      };
      window.addEventListener(SCRIPT_LOADED_EVENT, listener);
    });
  }

  const js7z = await window.JS7z({
    print: createCustomEvent(JS7zEventName.print),
    printErr: createCustomEvent(JS7zEventName.printErr),
    onAbort: createCustomEvent(JS7zEventName.onAbort),
    onExit: createCustomEvent(JS7zEventName.onExit),
  });

  if (['a', 'e'].includes(command[0])) {
    if (!payload) throw new Error('Payload is required');

    // Create the input folder
    js7z.FS.mkdir('/in');

    // Write each file into the input folder
    for (const file of payload) {
      const arrayBuffer = await file.arrayBuffer();
      js7z.FS.writeFile(`/in/${file.name}`, new Uint8Array(arrayBuffer));
    }

    const promise = new Promise<Out[]>((resolve, reject) => {
      self.addEventListener('onExit', (e) => {
        const exitCode = e.detail;
        // Compression unsuccessful
        if (exitCode !== 0)
          reject(Error(`7Zip failed with exit code ${exitCode}`));

        const out: Out[] = [];
        const files = js7z.FS.readdir('/out');
        for (const file of files) {
          // Skip the current and parent directory entries
          if (file === '.' || file === '..') continue;

          const buffer = js7z.FS.readFile(`/out/${file}`);
          out.push({
            filename: file,
            blob: new Blob([buffer as Uint8Array<ArrayBuffer>], {
              type: 'application/octet-stream',
            }),
          });
        }

        resolve(out);
      });
    });

    js7z.callMain(command);

    return promise;
  }

  js7z.callMain(command);
}
