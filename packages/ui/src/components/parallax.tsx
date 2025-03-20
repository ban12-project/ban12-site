'use client'

import { useEffect, useRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@repo/ui/lib/utils'

export const Parallax = ({
  asChild,
  className,
  style,
  target,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
  target?: (target: HTMLDivElement) => HTMLElement
}) => {
  const Comp = asChild ? Slot : 'div'

  const containerRef = useRef<React.ComponentRef<'div'>>(null)
  const resizeObserver = useRef<ResizeObserver>(null)
  const mutationObserver = useRef<MutationObserver>(null)

  useEffect(() => {
    if (!containerRef.current) return
    resizeObserver.current ||= new ResizeObserver(() => {
      onResize()
    })

    const container: HTMLElement =
      typeof target === 'function'
        ? target(containerRef.current)
        : containerRef.current
    let children = container.querySelectorAll<HTMLElement>('[data-parallax]')

    mutationObserver.current ||= new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type !== 'childList' ||
          (mutation.addedNodes.length === 0 &&
            mutation.removedNodes.length === 0)
        )
          return
        children = container.querySelectorAll<HTMLElement>('[data-parallax]')
        onResize()
      })
    })

    const onResize = () => {
      // const scrollbarWidth = container.offsetWidth - container.clientWidth
      const { width, height } = container.getBoundingClientRect()
      const { scrollTop, scrollLeft } = container

      // container.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
      container.style.setProperty('--container-width', `${width}px`)
      container.style.setProperty('--container-height', `${height}px`)
      container.style.setProperty('--scrollTop', `${scrollTop}px`)
      container.style.setProperty('--scrollLeft', `${scrollLeft}px`)

      for (let i = 0; i < children.length; i++) {
        const item = children[i]

        item.style.setProperty('--width', `unset`)
        item.style.setProperty('--height', `unset`)
        item.style.setProperty('--top', `unset`)
        item.style.setProperty('--left', `unset`)

        const { width, height, top, left } = item.getBoundingClientRect()

        item.style.setProperty('--width', `${width}px`)
        item.style.setProperty('--height', `${height}px`)
        item.style.setProperty('--top', `${top}px`)
        item.style.setProperty('--left', `${left}px`)
      }
    }

    resizeObserver.current.observe(container)
    mutationObserver.current.observe(container, {
      subtree: true,
      childList: true,
    })

    return () => {
      resizeObserver.current?.disconnect()
      mutationObserver.current?.disconnect()
    }
  }, [target])

  return (
    <Comp
      {...props}
      ref={containerRef}
      style={
        {
          ...style,
          '--perspective': '1px',
        } as React.CSSProperties
      }
      className={cn(
        'perspective-origin-bottom-right perspective-(--perspective)',
        className,
      )}
    />
  )
}

export const ParallaxItem = ({
  asChild,
  className,
  parallax,
  ...props
}: React.ComponentProps<'div'> & {
  asChild?: boolean
  parallax: string | number
}) => {
  const Comp = asChild ? Slot : 'div'

  const parallaxValue =
    typeof parallax === 'string' ? Number.parseFloat(parallax) : parallax
  const depth = 1 - 1 / parallaxValue
  const scale = 1.0 / (1.0 - depth)

  return (
    <Comp
      {...props}
      className={cn('origin-bottom-right', className)}
      style={
        {
          ...props.style,
          '--scale': 1 - depth,
          '--dy': `calc(${-depth} * (var(--height) - var(--container-height) + var(--top) + var(--scrollTop)) * ${scale})`,
          '--dx': `calc(${-depth} * (var(--width) - var(--container-width) + var(--left) + var(--scrollLeft)) * ${scale})`,
          '--depth': `${depth}px`,
          transform: `scale(var(--scale)) translate3d(var(--dx), var(--dy), var(--depth))`,
        } as React.CSSProperties
      }
      data-parallax={parallax}
    />
  )
}
