'use client'

import dynamic from 'next/dynamic'

const LivePhoto = dynamic(() => import('./live-photo'), {
  ssr: false,
  loading: () => <div className="aspect-[3/4] max-w-[540px]">loading</div>,
})

export default function LivePhotoClientOnly(
  props: React.ComponentProps<typeof LivePhoto>,
) {
  return <LivePhoto {...props} />
}
