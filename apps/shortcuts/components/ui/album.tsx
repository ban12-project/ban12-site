'use client'

import { forwardRef, useEffect, useMemo, useRef } from 'react'
import type { SelectShortcut } from '#/drizzle/schema'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

import { useResponsive } from '#/hooks/use-responsive'

import ShortcutCard from './shortcut-card'

type AlbumsProps = {
  shortcuts: SelectShortcut[]
}

let PADDING_LEFT: number,
  PADDING_RIGHT: number,
  GAP_SIZE = 12

const outerElementType = forwardRef<React.ElementRef<'div'>>(
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
  React.ElementRef<'div'>,
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

const Column: React.ComponentType<
  ListChildComponentProps<SelectShortcut[]>
> = ({ index, style, data }) => (
  <div
    className="pb-5"
    style={{
      ...style,
      left: `${Number.parseFloat(style.left as string) + PADDING_LEFT}px`,
      width: `${Number.parseFloat(style.width as string) - GAP_SIZE}px`,
    }}
  >
    <ShortcutCard
      className="block h-full [box-shadow:2px_4px_12px_#00000014] md:hover:[box-shadow:2px_4px_16px_#00000029] md:hover:[transform:scale3d(1.01,1.01,1.01)]"
      item={data[index]}
    />
  </div>
)

export default function Albums({ shortcuts }: AlbumsProps) {
  const anchorRef = useRef<React.ElementRef<'div'>>(null)
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

  return (
    <div className="h-[148px]">
      <div
        className="px-safe-max-4 absolute lg:px-[var(--container-inset,0)]"
        ref={anchorRef}
      ></div>
      <AutoSizer defaultWidth={1440}>
        {({ height, width }) => (
          <FixedSizeList
            itemSize={
              (width - PADDING_LEFT - PADDING_RIGHT) / columnNumber +
              GAP_SIZE / columnNumber
            }
            width={width}
            height={height}
            itemCount={shortcuts.length}
            itemData={shortcuts}
            outerElementType={outerElementType}
            innerElementType={innerElementType}
            layout="horizontal"
          >
            {Column}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  )
}
