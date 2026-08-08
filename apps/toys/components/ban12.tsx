'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRef } from 'react';
import Ban12Logo from '#/public/ban12.svg?no-merge-paths';

gsap.registerPlugin(useGSAP, MorphSVGPlugin, ScrollTrigger);

export default function Ban12(props: React.ComponentProps<'a'>) {
  const containerRef = useRef<React.ComponentRef<'a'>>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const circlesSvg =
        container.querySelector<SVGSVGElement>('#ban12__circles');
      const lettersSvg =
        container.querySelector<SVGSVGElement>('#ban12__letters');
      if (!circlesSvg || !lettersSvg) return;

      const circles = MorphSVGPlugin.convertToPath(
        Array.from(circlesSvg.querySelectorAll<SVGCircleElement>('circle')),
      );
      const letters = Array.from(
        lettersSvg.querySelectorAll<SVGPathElement>('path'),
      );
      if (circles.length !== letters.length || circles.length === 0) return;

      gsap.set(circlesSvg, { autoAlpha: 1 });
      gsap.set(circles, { xPercent: -100, yPercent: 100 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: container,
      });

      circles.forEach((circle, index) => {
        tl.to(
          circle,
          {
            xPercent: 50 + index * 120,
            opacity: 1,
            stagger: 0.3,
          },
          '<',
        );
      });

      circles.forEach((circle, index) => {
        tl.to(
          circle,
          {
            xPercent: 0,
            yPercent: 0,
            duration: 0.3,
            morphSVG: letters[index],
          },
          index === 0 ? '>' : '<',
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <Link href="https://ban12.com" ref={containerRef} title="ban12" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 91.02 62.11"
        id="ban12__circles"
        className="invisible fill-current dark:text-white"
      >
        <title>Ban12 Logo</title>
        <circle cx="10" cy="10" r="10" />
        <circle cx="10" cy="10" r="10" />
        <circle cx="10" cy="10" r="10" />
      </svg>
      <Ban12Logo className="hidden" id="ban12__letters" />
    </Link>
  );
}
