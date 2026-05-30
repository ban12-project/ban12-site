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
  const shouldClamp = text.length > 180;
  const toggleExpanded = React.useCallback(() => {
    React.startTransition(() => {
      setExpanded((value) => !value);
    });
  }, []);

  return (
    <div className="space-y-2">
      <ViewTransition update="morph" default="none">
        <p
          className={cn(
            'text-sm leading-6 text-muted-foreground',
            shouldClamp &&
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
      {shouldClamp && (
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
