'use client';

import { useLocale } from '@repo/i18n/client';
import { Skeleton } from '@repo/ui/components/skeleton';
import SuperEllipse from '@repo/ui/components/super-ellipse';
import { useResponsive } from '@repo/ui/hooks/use-responsive';
import { cn } from '@repo/ui/lib/utils';
import { useRef, useState } from 'react';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { type CellComponentProps, Grid } from 'react-window';
import { useInfiniteLoader } from 'react-window-infinite-loader';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';
import { fetchShortcutsByAlbumID } from '#/app/[lang]/(public)/actions';
import useRootDirection from '#/hooks/use-root-direction';
import type { SelectShortcut } from '#/lib/db/schema';
import type { Locale } from '#/lib/i18n';

import ShortcutCard from './shortcut-card';

type AlbumsProps = {
  shortcuts: SelectShortcut[];
  pageSize: number;
  currentPage: number;
};

let PADDING_START: number = 0,
  PADDING_END: number = 0;

const GAP_SIZE = 12;

const Column = ({
  columnIndex,
  style,
  items,
  isLoaded,
  width,
  height,
  ariaAttributes,
}: CellComponentProps<{
  items: SelectShortcut[];
  isLoaded: (index: number) => boolean;
  width: number;
  height: number;
}>) => {
  const lang = useLocale().locale as Locale;
  const item = items[columnIndex];

  return (
    <div
      {...ariaAttributes}
      className="pb-5"
      style={{
        ...style,
        width: `${Number.parseFloat(style.width as string) - GAP_SIZE}px`,
      }}
    >
      {isLoaded(columnIndex) ? (
        <SuperEllipse
          asChild
          svgProps={{ width, height: height - 20 /* pb-5 */, n: 10 }}
        >
          <ShortcutCard
            className="block h-full [box-shadow:2px_4px_12px_#00000014] md:hover:[box-shadow:2px_4px_16px_#00000029] md:hover:transform-[scale3d(1.01,1.01,1.01)]"
            item={item}
            lang={lang}
          />
        </SuperEllipse>
      ) : (
        <Skeleton className="h-full w-full rounded-3xl" />
      )}
    </div>
  );
};

export default function Albums({ shortcuts, pageSize }: AlbumsProps) {
  const anchorRef = useRef<React.ComponentRef<'div'>>(null);
  const direction = useRootDirection();

  useIsomorphicLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const onResize = () => {
      const { paddingLeft, paddingRight } = window.getComputedStyle(anchor);
      PADDING_START = Number.parseFloat(paddingLeft);
      PADDING_END = Number.parseFloat(paddingRight);
    };
    onResize();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const { isReady, breakpoints } = useResponsive();

  const columnNumber = (() => {
    if (breakpoints['2xl']) return 7;
    if (breakpoints.xl) return 6;
    if (breakpoints.lg) return 5;
    if (breakpoints.md) return 4;
    return 2;
  })();

  const [items, setItems] = useState<SelectShortcut[]>([...shortcuts]);
  const [hasNextPage, setHasNextPage] = useState(shortcuts.length >= pageSize);

  // Every items is loaded except for loading indicator
  const isItemLoaded = (index: number) => !hasNextPage || index < items.length;

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 1 : items.length;

  const loadMoreItems = async (startIndex: number, _stopIndex: number) => {
    const newItems = await fetchShortcutsByAlbumID(
      items[0].albumId!,
      pageSize,
      Math.floor(startIndex / pageSize) + 1,
    );
    setItems([...items, ...newItems]);
    setHasNextPage(newItems.length >= pageSize);
  };

  return (
    <div className="h-37">
      <div
        className="px-safe-max-4 absolute lg:px-(--container-inset,0)"
        ref={anchorRef}
      ></div>
      <AutoSizer
        style={{ width: '100%', height: '100%' }}
        renderProp={({ height = 148, width = 1440 }) => (
          <AlbumGrid
            height={height}
            width={width}
            items={items}
            itemCount={itemCount}
            columnNumber={columnNumber}
            isReady={isReady}
            direction={direction}
            isItemLoaded={isItemLoaded}
            loadMoreItems={loadMoreItems}
          />
        )}
      />
    </div>
  );
}

function AlbumGrid({
  height,
  width,
  items,
  itemCount,
  columnNumber,
  isReady,
  direction,
  isItemLoaded,
  loadMoreItems,
}: {
  height: number;
  width: number;
  items: SelectShortcut[];
  itemCount: number;
  columnNumber: number;
  isReady: boolean;
  direction: 'ltr' | 'rtl';
  isItemLoaded: (index: number) => boolean;
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>;
}) {
  const onRowsRendered = useInfiniteLoader({
    isRowLoaded: isItemLoaded,
    rowCount: itemCount,
    loadMoreRows: loadMoreItems,
    threshold: 2,
  });
  const itemSize =
    (width - PADDING_START - PADDING_END) / columnNumber +
    GAP_SIZE / columnNumber;

  return (
    <div
      className={cn(
        'hidden-scrollbar overscroll-x-contain',
        isReady || 'hidden',
      )}
      style={{
        width,
        height,
        paddingInlineStart: PADDING_START,
        paddingInlineEnd: PADDING_END,
      }}
    >
      <Grid
        cellComponent={Column}
        cellProps={{
          items,
          isLoaded: isItemLoaded,
          width: itemSize - GAP_SIZE,
          height,
        }}
        columnCount={itemCount}
        columnWidth={itemSize}
        rowCount={1}
        rowHeight={height}
        defaultWidth={width}
        defaultHeight={height}
        dir={direction}
        onCellsRendered={(visibleCells) =>
          onRowsRendered({
            startIndex: visibleCells.columnStartIndex,
            stopIndex: visibleCells.columnStopIndex,
          })
        }
        style={{
          width: width - PADDING_START - PADDING_END,
          height,
        }}
      />
    </div>
  );
}
