import { type ReactEventHandler, useRef } from 'react';

import { useDragDrop } from '#/hooks/use-drag-drop';
import type { HashCopy } from '#/lib/tool-copy';
import type { Append } from './file-explorer';

interface FileFormProps {
  append: Append;
  copy: HashCopy;
}

export default function Form({ append, copy }: FileFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit: ReactEventHandler = (e) => {
    e.preventDefault();
    const files = inputRef.current?.files;
    if (!files) return;
    for (let i = 0, len = files.length; i < len; i++) append(files[i]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const callback = useRef((files: File[]) => {
    for (let i = 0, len = files.length; i < len; i++) append(files[i]);
  }).current;
  const { isHovering } = useDragDrop(() => window, callback);

  return (
    <form onSubmit={onSubmit} className="h-[140px]">
      <label
        htmlFor="file"
        data-drag-over={isHovering}
        className="text-grayA10 flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-4 border-dotted border-blue-400 p-2 text-center hover:border-orange-500 data-[drag-over=true]:border-orange-500"
      >
        <span className="font-medium">{copy.drop}</span>
        <span className="text-sm">{copy.privacy}</span>
      </label>
      <input
        className="sr-only"
        ref={inputRef}
        type="file"
        name="file"
        id="file"
        multiple
        onChange={onSubmit}
      />
    </form>
  );
}
