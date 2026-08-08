import { type ReactEventHandler, useRef } from 'react';

import { useDragDrop } from '#/hooks/use-drag-drop';

import type { Append } from './file-explorer';

interface FileFormProps {
  append: Append;
}

export default function Form({ append }: FileFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit: ReactEventHandler = (e) => {
    e.preventDefault();
    const files = inputRef.current?.files;
    if (!files) return;
    for (let i = 0, len = files.length; i < len; i++) append(files[i]);
  };

  const callback = useRef((files: File[]) => {
    for (let i = 0, len = files.length; i < len; i++) append(files[i]);
  }).current;
  const { isHovering } = useDragDrop(() => window, callback);

  return (
    <form onSubmit={onSubmit} className="h-[100px]">
      <label
        htmlFor="file"
        data-drag-over={isHovering}
        className="text-grayA10 flex h-full w-full cursor-pointer items-center justify-center rounded-lg border-4 border-dotted border-blue-400 p-2 hover:border-orange-500 data-[drag-over=true]:border-orange-500"
      >
        Drag one or multi files to this page ...
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
      <button type="submit" className="sr-only">
        submit
      </button>
    </form>
  );
}
