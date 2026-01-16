'use client';

import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({ error }) {
  useEffect(() => {
    import('@sentry/nextjs').then((Sentry) => {
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <NextError />
      </body>
    </html>
  );
}
