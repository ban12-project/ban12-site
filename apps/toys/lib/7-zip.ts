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

type JS7zFileSystem = {
  mkdir(path: string): void;
  unlink(path: string): void;
  writeFile(path: string, data: Uint8Array): void;
  readdir(path: string): string[];
  readFile(path: string): Uint8Array;
};

interface JS7z {
  /** https://emscripten.org/docs/api_reference/Filesystem-API.html */
  FS: JS7zFileSystem;

  print: (message: string) => void;
  printErr: (message: string) => void;
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
    JS7z?: ({
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

function ensureDirectory(fs: JS7zFileSystem, path: string) {
  try {
    fs.mkdir(path);
  } catch {
    // js7z keeps its virtual filesystem between calls. Reusing the input and
    // output directories is safe when they already exist.
  }
}

function clearDirectory(fs: JS7zFileSystem, path: string) {
  for (const file of fs.readdir(path)) {
    if (file === '.' || file === '..') continue;
    try {
      fs.unlink(`${path}/${file}`);
    } catch {
      // Ignore entries that cannot be removed; the next 7-Zip call will
      // surface a useful error if the virtual filesystem is unusable.
    }
  }
}

async function waitForEngine() {
  if (window.JS7z) return;

  await new Promise<void>((resolve, reject) => {
    const startedAt = Date.now();
    const check = () => {
      if (window.JS7z) {
        resolve();
        return;
      }
      if (Date.now() - startedAt > 15_000) {
        reject(
          new Error(
            '7-Zip engine failed to load. Refresh the page and try again.',
          ),
        );
        return;
      }
      window.setTimeout(check, 50);
    };
    check();
  });
}

export async function call({ command, payload }: Call) {
  await waitForEngine();

  const createJS7z = window.JS7z;
  if (!createJS7z) throw new Error('7-Zip engine is unavailable');

  const js7z = await createJS7z({
    print: createCustomEvent(JS7zEventName.print),
    printErr: createCustomEvent(JS7zEventName.printErr),
    onAbort: createCustomEvent(JS7zEventName.onAbort),
    onExit: createCustomEvent(JS7zEventName.onExit),
  });

  if (['a', 'e'].includes(command[0])) {
    if (!payload) throw new Error('Payload is required');

    // Create the input folder
    ensureDirectory(js7z.FS, '/in');
    ensureDirectory(js7z.FS, '/out');
    clearDirectory(js7z.FS, '/in');
    clearDirectory(js7z.FS, '/out');

    // Write each file into the input folder
    for (const file of payload) {
      const arrayBuffer = await file.arrayBuffer();
      js7z.FS.writeFile(`/in/${file.name}`, new Uint8Array(arrayBuffer));
    }

    const promise = new Promise<Out[]>((resolve, reject) => {
      const onExit = (e: GlobalEventHandlersEventMap['onExit']) => {
        cleanup();
        const exitCode = e.detail;
        // Compression unsuccessful
        if (exitCode !== 0) {
          reject(Error(`7Zip failed with exit code ${exitCode}`));
          return;
        }

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
      };
      const onAbort = (e: GlobalEventHandlersEventMap['onAbort']) => {
        cleanup();
        reject(Error(`7Zip aborted${e.detail ? `: ${e.detail}` : ''}`));
      };
      const cleanup = () => {
        self.removeEventListener('onExit', onExit);
        self.removeEventListener('onAbort', onAbort);
      };

      self.addEventListener('onExit', onExit);
      self.addEventListener('onAbort', onAbort);

      try {
        js7z.callMain(command);
      } catch (error) {
        cleanup();
        reject(error);
      }
    });

    return promise;
  }

  js7z.callMain(command);
}
