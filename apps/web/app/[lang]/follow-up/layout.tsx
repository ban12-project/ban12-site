import { Suspense } from 'react'

import { LayoutSegmentContextProvider } from '#/components/layout-segment-context'

export default function Layout(props: {
  children: React.ReactNode
  drawer: React.ReactNode
}) {
  return (
    <LayoutSegmentContextProvider parallelRouteKey="drawer">
      <Suspense>
        {props.children}
        {props.drawer}
      </Suspense>
    </LayoutSegmentContextProvider>
  )
}
