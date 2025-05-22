'use client'

import { memo, useState } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { createPortal } from 'react-dom'

import { useIsomorphicLayoutEffect } from '../hooks/use-responsive'
import { generateSuperEllipseSVGPath } from '../lib/utils'

interface SVGProps extends React.ComponentProps<'svg'> {
  clipPathID: string
  width: number
  height: number
  n?: number
  steps?: number
}

function SuperEllipseSVG({
  clipPathID,
  width,
  height,
  n,
  steps,
  ...props
}: SVGProps) {
  const path = generateSuperEllipseSVGPath(width, height, n, steps)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={clipPathID ? 0 : width}
      height={clipPathID ? 0 : height}
      {...props}
    >
      {clipPathID ? (
        <clipPath id={clipPathID}>
          <path d={path} fill="white" />
        </clipPath>
      ) : (
        <path d={path} fill="white" />
      )}
    </svg>
  )
}

interface Props extends React.ComponentProps<'div'> {
  svgProps: Omit<SVGProps, 'clipPathID'>
  asChild?: boolean
}

const cacheSvg = new Map<SVGProps['clipPathID'], number>()

export default memo(function SuperEllipse({
  asChild,
  svgProps,
  ...props
}: Props) {
  const Comp = asChild ? Slot : 'div'

  const [svgContainer, setSvgContainer] = useState<React.ComponentRef<'div'>>()
  const clipPathID = [
    'SuperEllipse',
    svgProps.width,
    svgProps.height,
    svgProps.n,
    svgProps.steps,
  ]
    .filter(Boolean)
    .join('-')

  useIsomorphicLayoutEffect(() => {
    if (!cacheSvg.has(clipPathID)) {
      cacheSvg.set(clipPathID, 1)

      let svgContainer =
        document.querySelector<React.ComponentRef<'div'>>('#super-ellipse')
      if (!svgContainer) {
        svgContainer = document.createElement('div')
        svgContainer.setAttribute('id', 'super-ellipse')
        document.body.appendChild(svgContainer)
      }
      setSvgContainer(svgContainer)
    } else {
      cacheSvg.set(clipPathID, cacheSvg.get(clipPathID)! + 1)
    }

    return () => {
      const count = cacheSvg.get(clipPathID)
      if (count) {
        if (count === 1) {
          cacheSvg.delete(clipPathID)
        } else {
          cacheSvg.set(clipPathID, count - 1)
        }
      }
      if (cacheSvg.size === 0 && svgContainer) {
        document.removeChild(svgContainer)
        setSvgContainer(undefined)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Comp style={{ clipPath: `url(#${clipPathID})` }} {...props} />
      {svgContainer &&
        createPortal(
          <SuperEllipseSVG
            {...svgProps}
            width={svgProps.width}
            height={svgProps.height}
            clipPathID={clipPathID}
          />,
          svgContainer,
        )}
    </>
  )
}, arePropsEqual)

function arePropsEqual(oldProps: Props, newProps: Props) {
  for (const key in oldProps) {
    if (key === 'id') {
      continue
    }
    if (!Object.prototype.hasOwnProperty.call(newProps, key)) {
      return false
    }
    if (oldProps[key as keyof Props] !== newProps[key as keyof Props]) {
      return false
    }
  }

  for (const key in newProps) {
    if (key === 'id') {
      continue
    }

    if (!Object.prototype.hasOwnProperty.call(oldProps, key)) {
      return false
    }
  }

  return true
}
