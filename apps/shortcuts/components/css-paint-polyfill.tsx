'use client';

import Script from 'next/script';

export default function CSSPaintPolyfill() {
  // CSS Painting API polyfill https://github.com/GoogleChromeLabs/css-paint-polyfill

  return (
    <>
      <Script
        src="https://unpkg.com/css-paint-polyfill"
        onLoad={() => {
          // @ts-expect-error - CSS Painting API polyfill

          CSS.paintWorklet.addModule('/smooth-corners.js');
        }}
      />
      <link rel="preload" href="/smooth-corners.js" as="script" />
    </>
  );
}
