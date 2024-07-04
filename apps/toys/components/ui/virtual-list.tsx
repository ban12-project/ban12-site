'use client'

import {
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
} from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList, FixedSizeListProps } from 'react-window'

export const ListContext = createContext<
  Omit<Props<unknown>, 'data' | 'children'>
>({
  itemSize: 0,
})

const outerElementType = forwardRef<ElementRef<'div'>>(
  function Outer(props, ref) {
    return <div ref={ref} {...props} data-lenis-prevent></div>
  },
)

type Props<T> = {
  data: T
  children: ComponentPropsWithoutRef<typeof FixedSizeList<T>>['children']
  itemSize: FixedSizeListProps['itemSize']
}

export default function VirtualList<T extends unknown[]>({
  data,
  children,
  ...rest
}: Props<T>) {
  return (
    <ListContext.Provider value={rest}>
      {/**
       * https://github.com/bvaughn/react-virtualized-auto-sizer#documentation
       * defaultWidth defaultHeight useful for server-side rendering.
       */}
      <AutoSizer disableWidth defaultHeight={1000}>
        {({ height }) => (
          <FixedSizeList
            height={height}
            itemCount={data.length}
            itemSize={rest.itemSize}
            width="100%"
            outerElementType={outerElementType}
            itemData={data}
          >
            {children}
          </FixedSizeList>
        )}
      </AutoSizer>
    </ListContext.Provider>
  )
}
