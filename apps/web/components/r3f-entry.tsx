'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./scene'), { ssr: false });

export default function R3fEntry() {
  return (
    <Scene
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
      }}
      eventSource={
        typeof document !== 'undefined' ? document.documentElement : undefined
      }
      eventPrefix="client"
    />
  );
}
