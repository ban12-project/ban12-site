import { useEffect, useRef, useState } from 'react';

import { IN_BROWSER } from '#/lib/utils';

type Target = Window | HTMLElement;

export function useDragDrop(
  target: Target | (() => Target),
  callback: (files: File[]) => void,
) {
  const [isHovering, setIsHovering] = useState(false);
  const _target = useRef(
    IN_BROWSER ? (typeof target === 'function' ? target() : target) : null,
  );

  useEffect(() => {
    const target = _target.current;
    if (!target) return;

    const onDrop = (e: DragEvent) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault();

      if (!e.dataTransfer) return;

      if (e.dataTransfer.items) {
        const files: File[] = [];
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            if (!file) continue;
            files.push(file);
          }
        }

        if (files.length !== 0) callback(files);
      } else {
        // Use DataTransfer interface to access the file(s)
        callback(Array.from(e.dataTransfer.files));
      }
      setIsHovering(false);
    };

    const onDragOver = (e: DragEvent) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault();
      setIsHovering(true);
    };

    const onCancel = () => {
      setIsHovering(false);
    };

    target.addEventListener('drop', onDrop as EventListener);
    target.addEventListener('dragover', onDragOver as EventListener);
    target.addEventListener('dragend', onCancel);
    target.addEventListener('dragleave', onCancel);

    return () => {
      target.removeEventListener('drop', onDrop as EventListener);
      target.removeEventListener('dragover', onDragOver as EventListener);
      target.removeEventListener('dragend', onCancel);
      target.removeEventListener('dragleave', onCancel);
    };
  }, [callback]);

  return { isHovering };
}
