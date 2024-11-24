'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, ListChildComponentProps } from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'

import { fetchShortcutsByAlbumID } from '#/app/[lang]/(front)/actions'
import type { SelectShortcut } from '#/lib/db/schema'
import { useResponsive } from '#/hooks/use-responsive'

import ShortcutCard from './shortcut-card'
import { Skeleton } from './ui/skeleton'

type AlbumsProps = {
  shortcuts: SelectShortcut[]
  pageSize: number
  currentPage: number
}

let PADDING_LEFT: number, PADDING_RIGHT: number

const GAP_SIZE = 12

const outerElementType = forwardRef<React.ComponentRef<'div'>>(
  function Outer(props, ref) {
    return (
      <div
        ref={ref}
        {...props}
        className="hidden-scrollbar overscroll-x-contain"
      ></div>
    )
  },
)

const innerElementType = forwardRef<
  React.ComponentRef<'div'>,
  { style: React.CSSProperties }
>(function Inner({ style, ...rest }, ref) {
  return (
    <div
      ref={ref}
      style={{
        ...style,
        width: `${
          Number.parseFloat(style.width as string) +
          PADDING_LEFT +
          PADDING_RIGHT -
          GAP_SIZE
        }px`,
      }}
      {...rest}
    ></div>
  )
})

const Column = ({
  index,
  style,
  data,
  children,
}: ListChildComponentProps<SelectShortcut[]> & {
  children?: React.ReactNode
}) => (
  <div
    className="pb-5"
    style={{
      ...style,
      left: `${Number.parseFloat(style.left as string) + PADDING_LEFT}px`,
      width: `${Number.parseFloat(style.width as string) - GAP_SIZE}px`,
    }}
  >
    {children || (
      <ShortcutCard
        className="block h-full [box-shadow:2px_4px_12px_#00000014] md:hover:[box-shadow:2px_4px_16px_#00000029] md:hover:[transform:scale3d(1.01,1.01,1.01)]"
        item={data[index]}
      />
    )}
  </div>
)

export default function Albums({
  shortcuts,
  pageSize,
  currentPage,
}: AlbumsProps) {
  const anchorRef = useRef<React.ComponentRef<'div'>>(null)
  const update = () => {
    if (!anchorRef.current) return
    const { paddingLeft, paddingRight } = window.getComputedStyle(
      anchorRef.current,
    )
    PADDING_LEFT = Number.parseFloat(paddingLeft)
    PADDING_RIGHT = Number.parseFloat(paddingRight)
  }

  useEffect(update, [anchorRef])
  useEffect(() => {
    window.addEventListener('resize', update)

    return () => {
      window.removeEventListener('resize', update)
    }
  }, [])

  const breakpoints = useResponsive()

  const columnNumber = useMemo(() => {
    if (breakpoints['2xl']) return 8
    if (breakpoints.lg) return 6
    if (breakpoints.md) return 4
    return 2
  }, [breakpoints])

  const [items, setItems] = useState<SelectShortcut[]>([...shortcuts])
  const [hasNextPage, setHasNextPage] = useState(shortcuts.length >= pageSize)

  // Every items is loaded except for loading indicator
  const isItemLoaded = (index: number) => !hasNextPage || index < items.length

  // If there are more items to be loaded then add an extra row to hold a loading indicator.
  const itemCount = hasNextPage ? items.length + 1 : items.length

  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    const newItems = await fetchShortcutsByAlbumID(
      items[0].albumId!,
      pageSize,
      Math.floor(startIndex / pageSize) + 1,
    )
    setItems([...items, ...newItems])
    setHasNextPage(newItems.length >= pageSize)
  }

  return (
    <div className="h-[148px]">
      <div
        className="px-safe-max-4 absolute lg:px-[var(--container-inset,0)]"
        ref={anchorRef}
      ></div>
      <AutoSizer defaultWidth={1440}>
        {({ height, width }) => (
          <InfiniteLoader
            isItemLoaded={isItemLoaded}
            itemCount={itemCount}
            loadMoreItems={loadMoreItems}
            threshold={2}
          >
            {({ onItemsRendered, ref }) => (
              <FixedSizeList
                itemSize={
                  (width - PADDING_LEFT - PADDING_RIGHT) / columnNumber +
                  GAP_SIZE / columnNumber
                }
                width={width}
                height={height}
                itemCount={itemCount}
                itemData={items}
                outerElementType={outerElementType}
                innerElementType={innerElementType}
                layout="horizontal"
                onItemsRendered={onItemsRendered}
                ref={ref}
              >
                {(props) => (
                  <Column {...props}>
                    {isItemLoaded(props.index) ? null : (
                      <Skeleton className="h-full w-full rounded-3xl" />
                    )}
                  </Column>
                )}
              </FixedSizeList>
            )}
          </InfiniteLoader>
        )}
      </AutoSizer>
    </div>
  )
}
