import { Suspense, unstable_ViewTransition as ViewTransition } from 'react'
import { LoaderCircle } from 'lucide-react'

import { default as PagePrimitive, type Props } from '../../[id]/page'
import Drawer from './drawer'

export default function Page(props: Props) {
  return (
    <Drawer>
      <Suspense
        fallback={
          <ViewTransition exit="mapbox-fallback-exit">
            <div className="slide-in-from-bottom-10 fade-in fill-mode-forwards animate-in flex h-full items-center justify-center ease-[cubic-bezier(0.7,0,0.3,1)]">
              <LoaderCircle className="animate-spin" />
            </div>
          </ViewTransition>
        }
      >
        <ViewTransition enter="mapbox-enter">
          <PagePrimitive {...props} />
        </ViewTransition>
      </Suspense>
    </Drawer>
  )
}
