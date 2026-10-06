'use client';

import { useResponsive } from '@repo/ui/hooks/use-responsive';
import { useCallback, useEffect, useRef, useState } from 'react';
import List from '#/components/virtual-list';
import { type ToolLocale, toolCopy } from '#/lib/tool-copy';
import FileCard from './file-card';
import FileForm from './file-form';
import ToolHeader from './tool-header';

export type Append = (file: File) => void;
export type FileItem = { id: string } & Pick<
  File,
  'name' | 'type' | 'size' | 'lastModified'
> &
  Omit<MessageResult, 'index'> & { locale: ToolLocale };

type MessageResult = {
  sha256?: string;
  progress: number;
  time: number;
};

type HashJob = {
  file: File;
  callback: (data: MessageResult) => void;
};

const workerUrl = new URL('#/lib/calculate-hash-worker.ts', import.meta.url);

export default function FileExplorer({ locale }: { locale: ToolLocale }) {
  const copy = toolCopy[locale].hash;
  const [list, setList] = useState<FileItem[]>([]);
  const pendingJobs = useRef(new Map<string, HashJob>());
  const activeWorkers = useRef(new Map<string, Worker>());

  const processNext = useCallback(() => {
    const maxWorkers = Math.max(
      1,
      Math.min(navigator.hardwareConcurrency || 4, 8),
    );

    while (
      activeWorkers.current.size < maxWorkers &&
      pendingJobs.current.size > 0
    ) {
      const entry = pendingJobs.current.entries().next().value as
        | [string, HashJob]
        | undefined;
      if (!entry) return;

      const [id, job] = entry;
      pendingJobs.current.delete(id);

      const worker = new Worker(workerUrl);
      activeWorkers.current.set(id, worker);
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        activeWorkers.current.delete(id);
        worker.terminate();
        processNext();
      };

      worker.onmessage = (event: MessageEvent<MessageResult>) => {
        job.callback(event.data);
        if (event.data.progress === 1) finish();
      };

      const fail = (workerError: unknown) => {
        console.error('SHA-256 worker failed', workerError);
        job.callback({ progress: -1, time: 0 });
        finish();
      };
      worker.onerror = fail;
      worker.onmessageerror = fail;

      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (!(data instanceof ArrayBuffer)) {
          job.callback({ progress: -1, time: 0 });
          finish();
          return;
        }

        worker.postMessage(
          {
            name: job.file.name,
            type: job.file.type,
            size: job.file.size,
            lastModified: job.file.lastModified,
            data,
          },
          { transfer: [data] },
        );
      };
      reader.onerror = () => {
        job.callback({ progress: -1, time: 0 });
        finish();
      };
      reader.readAsArrayBuffer(job.file);
    }
  }, []);

  const clearAll = useCallback(() => {
    pendingJobs.current.clear();
    activeWorkers.current.forEach((worker) => {
      worker.terminate();
    });
    activeWorkers.current.clear();
    setList([]);
  }, []);

  useEffect(() => {
    const workersToTerminate = activeWorkers.current;
    return () => {
      pendingJobs.current.clear();
      workersToTerminate.forEach((worker) => {
        worker.terminate();
      });
      workersToTerminate.clear();
    };
  }, []);

  const append: Append = useCallback(
    (file) => {
      const id = crypto.randomUUID();
      const item: FileItem = {
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        locale,
        progress: 0,
        time: 0,
      };

      setList((currentList) => [...currentList, item]);
      pendingJobs.current.set(id, {
        file,
        callback: (props) => {
          setList((listToUpdate) => {
            const index = listToUpdate.findIndex(
              (currentItem) => currentItem.id === id,
            );
            if (index === -1) return listToUpdate;
            return listToUpdate.toSpliced(index, 1, {
              ...listToUpdate[index],
              ...props,
            });
          });
        },
      });
      processNext();
    },
    [locale, processNext],
  );

  const { breakpoints: isDesktop } = useResponsive(
    (breakpoint) => breakpoint.md,
  );

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-dvh max-w-7xl flex-col px-5 py-12"
    >
      <ToolHeader title={copy.title} description={copy.description} />
      <FileForm append={append} copy={copy} />
      <div
        className="mt-8 flex flex-1 flex-col rounded-2xl border bg-white/70 dark:bg-slate-950/40"
        aria-live="polite"
      >
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <h2 className="font-medium">
            {copy.results} ({list.length})
          </h2>
          {list.length > 0 && (
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-slate-800"
              onClick={clearAll}
            >
              {copy.clearAll}
            </button>
          )}
        </div>
        {list.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {copy.empty}
          </p>
        ) : (
          <div className="min-h-64 flex-1">
            <List data={list} itemSize={isDesktop ? 180 : 320}>
              {FileCard}
            </List>
          </div>
        )}
      </div>
    </main>
  );
}
