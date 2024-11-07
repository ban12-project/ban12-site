'use client'

import Script from 'next/script'

export default function CSSPaintPolyfill() {
  // CSS Painting API polyfill https://github.com/GoogleChromeLabs/css-paint-polyfill

  return (
    <>
      { }
      <Script
        src="https://unpkg.com/css-paint-polyfill"
        onLoad={() => {
          // @ts-expect-error - CSS Painting API polyfill
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          CSS.paintWorklet.addModule('/smooth-corners.js')
        }}
      />
      <link rel="preload" href="/smooth-corners.js" as="script" />
    </>
  )
}
