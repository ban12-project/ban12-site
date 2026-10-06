import { cn } from '@repo/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import type { RowComponentProps } from 'react-window';
import { useCopyToClipboard } from '#/hooks/use-copy-to-clipboard';
import { formatSize } from '#/lib/utils';

import type { FileItem } from './file-explorer';

type FileCardProps = RowComponentProps<{ data: FileItem[] }>;

// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
const DateTimeFormat = new Intl.DateTimeFormat('default', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: false,
});

export default function FileCard({
  index,
  style,
  data,
  ariaAttributes,
}: FileCardProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = (content?: string) => {
    if (!content || isCopied) return;
    copyToClipboard(content);
  };

  const item = data[data.length - index - 1];
  const isChinese = item.locale === 'zh-CN';
  const copyLabel = isChinese ? '复制 SHA-256' : 'Copy SHA-256';
  const copiedLabel = isChinese ? 'SHA-256 已复制' : 'SHA-256 copied';
  return (
    <dl
      {...ariaAttributes}
      style={style}
      className="grid min-w-0 grid-cols-1 gap-4 rounded-sm border-b p-4 md:grid-cols-4 md:p-5"
    >
      <div className="flex min-w-0 space-x-1">
        <dt className="font-medium">
          {item.locale === 'zh-CN' ? '名称' : 'Name'}
        </dt>
        <dd className="truncate" title={item.name}>
          {item.name}
        </dd>
      </div>
      <div className="flex min-w-0 space-x-1">
        <dt className="font-medium">
          {item.locale === 'zh-CN' ? '类型' : 'Type'}
        </dt>
        <dd>{item.type}</dd>
      </div>
      <div className="flex min-w-0 space-x-1">
        <dt className="font-medium">
          {item.locale === 'zh-CN' ? '大小' : 'Size'}
        </dt>
        <dd>{formatSize(item.size)}</dd>
      </div>
      <div className="flex min-w-0 space-x-1">
        <dt className="font-medium">
          {item.locale === 'zh-CN' ? '修改时间' : 'Modified'}
        </dt>
        <dd>{DateTimeFormat.format(new Date(item.lastModified))}</dd>
      </div>
      <div className="col-span-full">
        <dt>
          <span className="font-medium">SHA-256</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {`${(item.progress * 100).toFixed(2)}%`}
          </span>
          {item.progress === 1 && (
            <span className="ml-2 text-sm text-muted-foreground">{`${item.time} ms`}</span>
          )}
        </dt>
        <dd className="flex items-center">
          {item.progress < 0 ? (
            <span
              className="text-sm text-red-700 dark:text-red-400"
              role="alert"
            >
              {isChinese
                ? '无法计算此文件，请重新选择。'
                : 'Unable to calculate this file. Try choosing it again.'}
            </span>
          ) : (
            <>
              <span
                className={cn(
                  'min-w-0 overflow-auto break-all',
                  item.progress !== 1 && 'invisible',
                )}
              >
                <code>{item.sha256}</code>
              </span>
              {item.progress === 1 && (
                <button
                  type="button"
                  className="shrink-0 rounded-md p-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2"
                  aria-label={isCopied ? copiedLabel : copyLabel}
                  title={isCopied ? copiedLabel : copyLabel}
                  onClick={() => onCopy(item.sha256)}
                >
                  {isCopied ? (
                    <Check aria-hidden="true" />
                  ) : (
                    <Copy aria-hidden="true" />
                  )}
                </button>
              )}
            </>
          )}
        </dd>
      </div>
    </dl>
  );
}
