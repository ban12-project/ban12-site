'use client'

import Script from 'next/script'

export default function CSSPaintPolyfill() {
  // CSS Painting API polyfill https://github.com/GoogleChromeLabs/css-paint-polyfill

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script
        src="https://unpkg.com/css-paint-polyfill"
        onLoad={() => {
          // @ts-ignore
          CSS.paintWorklet.addModule('/smooth-corners.js')
        }}
      />
      <link rel="preload" href="/smooth-corners.js" as="script" />
    </>
  )
}
