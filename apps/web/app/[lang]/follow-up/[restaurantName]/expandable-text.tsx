'use client';

import { Button } from '@repo/ui/components/button';
import { cn } from '@repo/ui/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { ViewTransition } from 'react';

export default function ExpandableText({
  text,
  className,
  labels,
  previewLines = 4,
}: {
  text: string;
  className?: string;
  labels: {
    showLess: string;
    showMore: string;
  };
  previewLines?: 3 | 4 | 5;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [isClamped, setIsClamped] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const element = textRef.current;
    if (!element || expanded) {
      setIsClamped(false);
      return;
    }

    const checkClamping = () => {
      setIsClamped(
        text.length > 0 &&
          previewLines > 0 &&
          element.scrollHeight > element.clientHeight + 1,
      );
    };

    checkClamping();
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(checkClamping);
    resizeObserver?.observe(element);
    window.addEventListener('resize', checkClamping);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', checkClamping);
    };
  }, [expanded, previewLines, text]);

  const toggleExpanded = React.useCallback(() => {
    React.startTransition(() => {
      setExpanded((value) => !value);
    });
  }, []);

  return (
    <div className="space-y-2">
      <ViewTransition update="morph" default="none">
        <p
          ref={textRef}
          className={cn(
            'text-sm leading-6 text-muted-foreground',
            !expanded && {
              'line-clamp-3': previewLines === 3,
              'line-clamp-4': previewLines === 4,
              'line-clamp-5': previewLines === 5,
            },
            className,
          )}
        >
          {text}
        </p>
      </ViewTransition>
      {(isClamped || expanded) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          onClick={toggleExpanded}
        >
          {expanded ? (
            <>
              <ChevronUp />
              {labels.showLess}
            </>
          ) : (
            <>
              <ChevronDown />
              {labels.showMore}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
