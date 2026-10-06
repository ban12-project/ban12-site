'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  // FormLabel,
  // FormMessage,
} from '@repo/ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Loader2 } from 'lucide-react';
import {
  type ChangeEventHandler,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useDragDrop } from '#/hooks/use-drag-drop';
import { useSaveFile } from '#/hooks/use-save-file';
import { call, JS7zEventName, type Out } from '#/lib/7-zip';
import { type SevenZipCopy, type ToolLocale, toolCopy } from '#/lib/tool-copy';

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
} as const;

type Format = (typeof supportedFormats.packingAndUnpacking)[number];
type Operation = 'compress' | 'extract';

const archiveExtensions = [
  ...supportedFormats.packingAndUnpacking,
  ...supportedFormats.onlyUnpacking,
].map((format) => `.${format.toLowerCase()}`);

export default function SevenZip({ locale }: { locale: ToolLocale }) {
  const copy = toolCopy[locale].sevenZip;
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const outputFilesRef = useRef<Out[]>([]);
  const [outputCount, setOutputCount] = useState(0);

  const resolve = async (
    files: File[],
    operation: Operation,
    format: Format,
  ) => {
    if (pendingRef.current) return;
    if (files.length === 0) return;
    pendingRef.current = true;
    outputFilesRef.current = [];
    setOutputCount(0);
    progress.reset();
    setPending(true);

    try {
      const result = await call({
        command:
          operation === 'extract'
            ? ['e', '/in/*', '-o/out']
            : ['a', `/out/archive.${format.toLowerCase()}`, '/in/*'],
        payload: files,
      });

      if (result) {
        outputFilesRef.current = result;
        setOutputCount(result.length);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '7-Zip failed');
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  };

  useLogPrint();
  const progress = useExtractProgressFromStdout();

  return (
    <FormComponent
      pending={pending}
      outputFilesRef={outputFilesRef}
      resolve={resolve}
      copy={copy}
      progress={progress.value}
      outputCount={outputCount}
      onOutputSaved={() => setOutputCount(0)}
    />
  );
}

function useExtractProgressFromStdout() {
  const [progress, setProgress] = useState(0);

  const onPrint = useCallback((e: { detail: string }) => {
    const progressMatch = e.detail.match(/(\d+)%/);
    if (progressMatch) {
      const progress = parseInt(progressMatch[1], 10);
      if (!Number.isNaN(progress) && progress >= 0 && progress <= 100) {
        setProgress(progress);
      }
    }
  }, []);

  const onAbort = useCallback(() => {
    setProgress(0);
  }, []);

  const onExit = useCallback((e: { detail: number }) => {
    setProgress(e.detail !== 0 ? 0 : 100);
  }, []);

  useEffect(() => {
    window.addEventListener(JS7zEventName.print, onPrint);
    window.addEventListener(JS7zEventName.onAbort, onAbort);
    window.addEventListener(JS7zEventName.onExit, onExit);

    return () => {
      window.removeEventListener(JS7zEventName.print, onPrint);
      window.removeEventListener(JS7zEventName.onAbort, onAbort);
      window.removeEventListener(JS7zEventName.onExit, onExit);
    };
  }, [onAbort, onExit, onPrint]);

  return { value: progress, reset: () => setProgress(0) };
}

function useLogPrint() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const onPrint = (e: { detail: string }) => {
      console.log(e.detail);
    };

    window.addEventListener(JS7zEventName.print, onPrint);

    return () => {
      window.removeEventListener(JS7zEventName.print, onPrint);
    };
  }, []);
}

const FormSchema = z.object({
  format: z.enum(supportedFormats.packingAndUnpacking, {
    error: (issue) =>
      issue === undefined
        ? 'Please select an format to continue.'
        : 'Invalid format.',
  }),
});

function FormComponent({
  pending,
  outputFilesRef,
  resolve,
  copy,
  progress,
  outputCount,
  onOutputSaved,
}: {
  pending: boolean;
  outputFilesRef: RefObject<Out[]>;
  resolve: (files: File[], operation: Operation, format: Format) => void;
  copy: SevenZipCopy;
  progress: number;
  outputCount: number;
  onOutputSaved: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [operation, setOperation] = useState<Operation>('compress');

  const { saveFile } = useSaveFile();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      format: '7z',
    },
  });

  const format = useWatch({ name: 'format', control: form.control });

  const callback = useCallback(
    (files: File[]) => resolve(files, operation, format),
    [format, operation, resolve],
  );
  const { isHovering } = useDragDrop(() => window, callback);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files) return;
    resolve(Array.from(files), operation, format);
    e.target.value = '';
  };

  const onSubmit = async (/* data: z.infer<typeof FormSchema> */) => {
    if (outputCount === 0) {
      return inputRef.current?.click();
    }

    try {
      const saved = await saveFile(outputFilesRef.current);
      if (!saved) return;
      outputFilesRef.current.length = 0;
      onOutputSaved();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save output',
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        ref={formRef}
        className="rounded-2xl border bg-white/70 p-5 shadow-sm dark:bg-slate-950/40 sm:p-8"
        data-drag-over={isHovering}
        aria-busy={pending}
      >
        <div className="flex flex-col gap-5">
          <fieldset className="flex w-full rounded-lg border p-1 sm:w-fit">
            <legend className="sr-only">{copy.operation}</legend>
            <button
              type="button"
              className="flex-1 rounded-md px-4 py-2 text-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 data-[active=true]:bg-slate-900 data-[active=true]:text-white dark:hover:bg-slate-800 dark:data-[active=true]:bg-white dark:data-[active=true]:text-slate-900 sm:flex-none"
              data-active={operation === 'compress'}
              aria-pressed={operation === 'compress'}
              onClick={() => setOperation('compress')}
            >
              {copy.compress}
            </button>
            <button
              type="button"
              className="flex-1 rounded-md px-4 py-2 text-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 data-[active=true]:bg-slate-900 data-[active=true]:text-white dark:hover:bg-slate-800 dark:data-[active=true]:bg-white dark:data-[active=true]:text-slate-900 sm:flex-none"
              data-active={operation === 'extract'}
              aria-pressed={operation === 'extract'}
              onClick={() => setOperation('extract')}
            >
              {copy.extract}
            </button>
          </fieldset>

          <input
            className="sr-only"
            id="archive-file"
            name="archive-file"
            type="file"
            accept={
              operation === 'extract' ? archiveExtensions.join(',') : undefined
            }
            multiple={operation === 'compress'}
            ref={inputRef}
            onChange={onChange}
          />

          {operation === 'compress' && (
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a format to pack" />
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
          )}

          <label
            htmlFor="archive-file"
            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-colors hover:border-slate-500 hover:bg-slate-50 focus-within:outline-2 focus-within:outline-offset-2 data-[drag-over=true]:border-blue-600 data-[drag-over=true]:bg-blue-50 dark:hover:bg-slate-900 dark:data-[drag-over=true]:bg-blue-950/30"
            data-drag-over={isHovering}
          >
            <span className="font-medium">
              {outputCount > 0
                ? copy.saveReady(outputCount)
                : operation === 'extract'
                  ? copy.chooseArchive
                  : copy.chooseFiles}
            </span>
            <span className="mt-1 text-sm text-slate-500">
              {outputCount > 0
                ? copy.saveHint
                : operation === 'extract'
                  ? copy.archiveSupport
                  : copy.multiple}
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={pending}
              className="touch-manipulation"
            >
              {pending && (
                <Loader2 className="animate-spin" aria-hidden="true" />
              )}
              {outputCount !== 0 ? copy.save : copy.choose}
            </Button>
            {pending && (
              <div className="min-w-44 flex-1" aria-live="polite">
                <div className="mb-1 flex justify-between text-sm">
                  <span>{copy.processing}</span>
                  <span className="tabular-nums">{progress}%</span>
                </div>
                <progress className="h-2 w-full" max={100} value={progress}>
                  {progress}%
                </progress>
              </div>
            )}
          </div>
          {!pending && outputCount > 0 && (
            <p
              className="text-sm text-green-700 dark:text-green-400"
              role="status"
            >
              {copy.complete}
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}
