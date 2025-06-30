import { Suspense } from 'react'

import { LayoutSegmentContextProvider } from '#/components/layout-segment-context'

export default function Layout(props: {
  children: React.ReactNode
  drawer: React.ReactNode
}) {
  return (
    <Suspense>
      <LayoutSegmentContextProvider parallelRouteKey="drawer">
        {props.children}
        {props.drawer}
      </LayoutSegmentContextProvider>
    </Suspense>
  )
}
