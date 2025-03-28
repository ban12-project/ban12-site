// document https://developers.cloudflare.com/turnstile/

import { memo, useEffect, useRef } from 'react'
import Script from 'next/script'
import { cn } from '@repo/ui/lib/utils'

declare global {
  type WidgetId = string

  interface Window {
    /** Cloudflare Turnstile */
    turnstile: {
      render(
        container: string | HTMLElement,
        params: {
          sitekey: string
          theme?: 'light' | 'dark'
          callback?(token: string): void
        },
      ): WidgetId
      getResponse(widgetId: WidgetId): unknown
      reset(widgetId: WidgetId): void
      remove(widgetId: WidgetId): void
    }
  }
}

type Props = React.HTMLAttributes<React.ComponentRef<'div'>> & {
  containerId?: string
}

export default memo(function CloudflareTurnstile({
  containerId = 'cf-turnstile-widget',
  className,
  ...props
}: Props) {
  const widgetId = useRef<string>(undefined)

  useEffect(() => {
    const callbacks = [
      () => {
        if (!process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY) return
        if (widgetId.current) window.turnstile.remove(widgetId.current)

        widgetId.current = window.turnstile.render(`#${containerId}`, {
          sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
        })
      },
    ]
    if (typeof window.onloadTurnstileCallback === 'function')
      callbacks.push(window.onloadTurnstileCallback)

    window.onloadTurnstileCallback = () => {
      callbacks.forEach((callback) => callback())
    }

    if (window.turnstile) window.onloadTurnstileCallback()

    return () => {
      window.onloadTurnstileCallback = undefined
      if (!widgetId.current) return
      window.turnstile.remove(widgetId.current)
      widgetId.current = undefined
    }
  })

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        async
        defer
      />
      <div
        {...props}
        id={containerId}
        className={cn('min-h-[71px]', className)}
      />
    </>
  )
})
