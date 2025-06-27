'use client'

import * as React from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'

const LayoutSegmentContext =
  React.createContext<ReturnType<typeof useSelectedLayoutSegment>>(null)

export function useLayoutSegment() {
  return React.useContext(LayoutSegmentContext)
}

interface LayoutSegmentContextProviderProps {
  children?: React.ReactNode
  parallelRouteKey?: string
}

export function LayoutSegmentContextProvider({
  parallelRouteKey,
  ...props
}: LayoutSegmentContextProviderProps) {
  const segment = useSelectedLayoutSegment(parallelRouteKey)

  return <LayoutSegmentContext.Provider {...props} value={segment} />
}
