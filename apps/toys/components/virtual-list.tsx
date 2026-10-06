'use client';

import { createContext } from 'react';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { List, type ListProps } from 'react-window';

export const ListContext = createContext<Pick<Props<unknown[]>, 'itemSize'>>({
  itemSize: 0,
});

type Props<T> = {
  data: T;
  children: ListProps<{ data: T }>['rowComponent'];
  itemSize: number | string;
};

export default function VirtualList<T extends unknown[]>({
  data,
  children,
  ...rest
}: Props<T>) {
  const RowComponent = children;

  return (
    <ListContext.Provider value={rest}>
      {/**
       * https://github.com/bvaughn/react-virtualized-auto-sizer#documentation
       * defaultWidth defaultHeight useful for server-side rendering.
       */}
      <AutoSizer
        style={{ width: '100%', height: '100%' }}
        renderProp={({ height = 1000 }) => (
          <div data-lenis-prevent style={{ height }}>
            <List
              rowComponent={RowComponent}
              rowCount={data.length}
              rowHeight={rest.itemSize}
              rowProps={{ data }}
              defaultHeight={height}
              tagName="div"
              style={{ height, width: '100%' }}
            />
          </div>
        )}
      />
    </ListContext.Provider>
  );
}
