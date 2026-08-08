'use client';

import { Textarea } from '@repo/ui/components/textarea';
import { LoaderCircleIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense, useDeferredValue, useState } from 'react';
import ToolHeader from '#/components/tool-header';
import { type ToolLocale, toolCopy } from '#/lib/tool-copy';

const DiffView = dynamic(() => import('./diff-view'), { ssr: false });

export default function TextDiff({ locale }: { locale: ToolLocale }) {
  const copy = toolCopy[locale].compare;
  const [old, setOld] = useState('');
  const [newer, setNewer] = useState('');
  const deferredOld = useDeferredValue(old);
  const deferredNewer = useDeferredValue(newer);

  return (
    <main
      id="main-content"
      className="px-safe-max-4 container mx-auto flex min-h-screen flex-col gap-5"
    >
      <ToolHeader title={copy.title} description={copy.description} />

      <form className="grid gap-5 md:grid-cols-2">
        <label htmlFor="original-text" className="grid gap-2">
          <span className="text-sm font-medium">{copy.original}</span>
          <Textarea
            variant="ios"
            id="original-text"
            aria-label={locale === 'zh-CN' ? '原始文本' : 'Original text'}
            placeholder={copy.originalPlaceholder}
            value={old}
            onChange={(e) => setOld(e.target.value)}
          />
        </label>
        <label htmlFor="updated-text" className="grid gap-2">
          <span className="text-sm font-medium">{copy.updated}</span>
          <Textarea
            variant="ios"
            id="updated-text"
            aria-label={locale === 'zh-CN' ? '更新后的文本' : 'Updated text'}
            placeholder={copy.updatedPlaceholder}
            value={newer}
            onChange={(e) => setNewer(e.target.value)}
          />
        </label>
      </form>

      <section
        className="min-h-48 flex-1 rounded-xl border p-4"
        aria-live="polite"
      >
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium">{copy.diff}</h2>
          {(old || newer) && (
            <button
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              onClick={() => {
                setOld('');
                setNewer('');
              }}
            >
              {copy.clear}
            </button>
          )}
        </div>
        <Suspense
          fallback={<LoaderCircleIcon className="mx-auto animate-spin" />}
        >
          {old || newer ? (
            <DiffView old={deferredOld} newer={deferredNewer} />
          ) : (
            <p className="text-sm text-slate-500" role="status">
              {copy.empty}
            </p>
          )}
        </Suspense>
      </section>

      <p className="text-center">
        {copy.crate}{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/mitsuhiko/similar"
        >
          mitsuhiko
        </a>
      </p>
    </main>
  );
}
