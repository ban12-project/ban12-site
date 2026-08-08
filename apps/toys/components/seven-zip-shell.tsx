'use client';

import { useEffect, useState } from 'react';
import type { ToolLocale } from '#/lib/tool-copy';
import SevenZip from './7-zip';

export default function SevenZipShell({ locale }: { locale: ToolLocale }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-toys-7zip]',
    );
    if (existing) {
      setMounted(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '/js7z-mt-fs-ec-2.4.1/js7z.js';
    script.async = true;
    script.dataset.toys7zip = 'true';
    document.head.append(script);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl border bg-white/70 p-5 text-sm text-slate-600 shadow-sm dark:bg-slate-950/40 dark:text-slate-300 sm:p-8">
        {locale === 'zh-CN'
          ? '正在加载 7-Zip 引擎…'
          : 'Loading the 7-Zip engine…'}
      </div>
    );
  }

  return <SevenZip locale={locale} />;
}
