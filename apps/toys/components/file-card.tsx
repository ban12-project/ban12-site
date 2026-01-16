import { cn } from '@repo/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import type { ListChildComponentProps } from 'react-window';
import { useCopyToClipboard } from '#/hooks/use-copy-to-clipboard';
import { formatSize } from '#/lib/utils';

import type { FileItem } from './file-explorer';

type FileCardProps = ListChildComponentProps<FileItem[]>;

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

export default function FileCard({ index, style, data }: FileCardProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const onCopy = (content?: string) => {
    if (!content || isCopied) return;
    copyToClipboard(content);
  };

  const item = data[data.length - index - 1];

  return (
    <dl
      style={style}
      className="grid grid-cols-1 gap-5 rounded-sm md:grid-cols-4 md:p-5"
    >
      <div className="flex space-x-1">
        <dt>name:</dt>
        <dd>{item.name}</dd>
      </div>
      <div className="flex space-x-1">
        <dt>type:</dt>
        <dd>{item.type}</dd>
      </div>
      <div className="flex space-x-1">
        <dt>size:</dt>
        <dd>{formatSize(item.size)}</dd>
      </div>
      <div className="flex space-x-1">
        <dt>lastModified:</dt>
        <dd>{DateTimeFormat.format(new Date(item.lastModified))}</dd>
      </div>
      <div className="col-span-full">
        <dt>
          sha256:
          <span className="ml-2 text-sm">
            {`${(item.progress * 100).toFixed(2)}%`}
          </span>
          <span className="ml-2 text-sm">{`${item.time}ms`}</span>
        </dt>
        <dd
          className={cn(
            'flex items-center',
            item.progress !== 1 && 'invisible',
          )}
        >
          <span className="overflow-auto">
            <code>{item.sha256}</code>
          </span>
          <button
            type="button"
            className="p-2"
            onClick={() => onCopy(item.sha256)}
          >
            {isCopied ? <Check /> : <Copy />}
          </button>
        </dd>
      </div>
    </dl>
  );
}
