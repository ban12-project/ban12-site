'use client'

import Script from 'next/script'

type LivePhotosKit = typeof import('livephotoskit')

declare global {
  interface Window {
    LivePhotosKit: LivePhotosKit
  }
}

export const livePhotosKitModulePromise = (async function () {
  if (typeof document === 'undefined') return

  return new Promise<LivePhotosKit>((resolve) => {
    if (window.LivePhotosKit) resolve(window.LivePhotosKit)

    const listener = () => {
      resolve(window.LivePhotosKit)
      document.removeEventListener('livephotoskitloaded', listener)
    }

    // https://developer.apple.com/documentation/livephotoskitjs/livephotoskit/livephotoskit_loaded
    document.addEventListener('livephotoskitloaded', listener)
  })
})()

export function LivePhotosKitLoader() {
  return (
    <Script
      strategy="afterInteractive"
      src="https://cdn.apple-livephotoskit.com/lpk/1/livephotoskit.js"
      crossOrigin="anonymous"
    />
  )
}
