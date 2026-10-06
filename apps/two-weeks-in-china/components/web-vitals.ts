'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    sendGAEvent('event', metric.name, {
      value: Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value,
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  });

  return null;
}
