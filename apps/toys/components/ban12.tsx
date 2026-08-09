'use client';

import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import Link from 'next/link';
import { useRef } from 'react';
import Ban12Logo from '#/public/ban12.svg?no-merge-paths';

gsap.registerPlugin(useGSAP, MorphSVGPlugin);

const CIRCLE_PATH =
  'M20,10 C20,15.52285 15.52285,20 10,20 4.47715,20 0,15.52285 0,10 0,4.47715 4.47715,0 10,0 15.52285,0 20,4.47715 20,10 z';

export default function Ban12(props: React.ComponentProps<'a'>) {
  const containerRef = useRef<React.ComponentRef<'a'>>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const selector = gsap.utils.selector(container);
      const circlesSvg = selector<SVGSVGElement>('#ban12__circles')[0];
      const circles = selector<SVGPathElement>('#ban12__circles > path');
      const letters = selector<SVGPathElement>('#ban12__letters > path');
      const letterPaths = letters.map((letter) => letter.getAttribute('d'));
      if (
        !circlesSvg ||
        circles.length !== letterPaths.length ||
        circles.length === 0 ||
        letterPaths.some((path) => !path)
      ) {
        return;
      }

      gsap.set(circlesSvg, { autoAlpha: 0 });
      gsap.set(circles, { xPercent: -100, yPercent: 100 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        paused: true,
      });

      tl.set(circlesSvg, { autoAlpha: 1 });

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
            morphSVG: letterPaths[index] as string,
          },
          index === 0 ? '>' : '<',
        );
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          observer.disconnect();
          tl.play();
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(container);

      return () => observer.disconnect();
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
        <path d={CIRCLE_PATH} />
        <path d={CIRCLE_PATH} />
        <path d={CIRCLE_PATH} />
      </svg>
      <Ban12Logo className="hidden" id="ban12__letters" />
    </Link>
  );
}
