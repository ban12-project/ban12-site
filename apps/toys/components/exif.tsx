'use client';

import { type ChangeEventHandler, useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from '#/hooks/use-copy-to-clipboard';
import { useDragDrop } from '#/hooks/use-drag-drop';
import { type ToolLocale, toolCopy } from '#/lib/tool-copy';
import ToolHeader from './tool-header';

const ZEROPERL_WASM_CDN_URL =
  'https://cdn.jsdelivr.net/npm/@6over3/zeroperl-ts@1.0.10/dist/esm/zeroperl.wasm';
const ZEROPERL_WASM_LOCAL_URL = '/zeroperl.wasm';

async function fetchWasm(url: string) {
  const response = await fetch(url, { cache: 'force-cache' });
  const contentType = response.headers.get('content-type');
  if (!response.ok || !contentType?.startsWith('application/wasm')) {
    throw new Error(
      `Unable to load zeroperl WebAssembly from ${url} (${response.status} ${contentType ?? 'unknown content type'})`,
    );
  }
  return response;
}

async function fetchZeroPerlWasm() {
  try {
    return await fetchWasm(ZEROPERL_WASM_CDN_URL);
  } catch (cdnError) {
    try {
      return await fetchWasm(ZEROPERL_WASM_LOCAL_URL);
    } catch (localError) {
      throw new AggregateError(
        [cdnError, localError],
        'Unable to load the ExifTool WebAssembly runtime',
      );
    }
  }
}

export default function Exif({ locale }: { locale: ToolLocale }) {
  const copy = toolCopy[locale].exif;
  const [fileName, setFileName] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isCopied, copyToClipboard } = useCopyToClipboard({});

  const process = useCallback(
    async (file: File) => {
      setLoading(true);
      setFileName(file.name);
      setMetadata('');
      setError('');

      try {
        const { parseMetadata } = await import('@uswriting/exiftool');
        const result = await parseMetadata(file, { fetch: fetchZeroPerlWasm });
        if (!result.success) {
          throw new Error(result.error || 'Unable to read metadata');
        }
        setMetadata(result.data);
      } catch (error) {
        const message = error instanceof Error ? error.message : copy.failed;
        toast.error(message);
        setError(copy.failed);
        setFileName('');
      } finally {
        setLoading(false);
      }
    },
    [copy.failed],
  );

  const callback = useCallback(
    (files: File[]) => {
      const [file] = files;
      if (file) process(file);
    },
    [process],
  );

  const { isHovering } = useDragDrop(() => window, callback);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      process(file);
      event.target.value = '';
    },
    [process],
  );

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-12"
    >
      <ToolHeader title={copy.title} description={copy.description} />
      <form
        className="mx-auto w-full max-w-xl rounded-2xl border bg-white/70 p-6 shadow-sm dark:bg-slate-950/40"
        aria-busy={loading}
      >
        <h2 className="mb-2 block text-lg">{copy.choose}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{copy.privacy}</p>
        <label
          htmlFor="exif-file"
          data-drag-over={isHovering}
          className="flex min-h-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-5 text-center text-sm transition-colors hover:border-slate-500 focus-within:outline-2 focus-within:outline-offset-2 data-[drag-over=true]:border-blue-600 data-[drag-over=true]:bg-blue-50 dark:data-[drag-over=true]:bg-blue-950/30"
        >
          {copy.drop}
        </label>
        <input
          className="sr-only"
          id="exif-file"
          name="exif-file"
          type="file"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={handleFileChange}
        />
        {loading && (
          <p className="mt-4 text-sm" role="status">
            {copy.reading}
          </p>
        )}
        {error && (
          <p
            className="mt-4 text-sm text-red-700 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </form>
      {metadata && (
        <section
          className="mx-auto w-full max-w-5xl rounded-xl border p-6"
          aria-live="polite"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="min-w-0 truncate font-medium" title={fileName}>
              {copy.metadata}: {fileName}
            </h2>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => copyToClipboard(metadata)}
              >
                {isCopied ? copy.copied : copy.copy}
              </button>
              <button
                type="button"
                className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => {
                  setMetadata('');
                  setFileName('');
                }}
              >
                {copy.clear}
              </button>
            </div>
          </div>
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted p-4 text-sm">
            {metadata}
          </pre>
        </section>
      )}
    </main>
  );
}
