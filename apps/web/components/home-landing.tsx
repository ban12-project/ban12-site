'use client'

import * as React from 'react'
import { useGSAP } from '@gsap/react'
import { useLocale } from '@repo/i18n/client'
import FlairFollower from '@repo/ui/components/flair-follower'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

import { type Messages } from '#/lib/i18n'

gsap.registerPlugin(useGSAP, SplitText)

type Props = Readonly<{
  messages: Messages
}>

export default function HomeLanding({ messages }: Props) {
  const container = React.useRef<React.ComponentRef<'section'>>(null!)
  const { locale } = useLocale()

  useGSAP(
    () => {
      const selector = gsap.utils.selector(container)
      const heading = selector('.home-landing__heading-text')[0]

      const defaults = {
        ease: 'power2.out',
        duration: 0.6,
      }

      const splitText = () => {
        const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })

        const tl = gsap.timeline({ defaults })

        const split = new SplitText(heading, {
          type: 'words, lines',
          aria: 'hidden',
          mask: 'lines',
          prepareText: (text) => {
            return [...segmenter.segment(text)]
              .map((s) => s.segment)
              .join(String.fromCharCode(8204))
          },
          wordDelimiter: /\u200c/,
          autoSplit: true,
        })

        tl.from(split.words, {
          yPercent: -100,
          ease: 'back.out',
          stagger: {
            amount: 0.5,
            from: 'random',
          },
        })

        tl.eventCallback('onComplete', () => {
          // split.revert()
        })

        return tl
      }

      const createTimeline = () => {
        const tl = gsap.timeline({
          id: 'home-landing',
          defaults,
        })

        tl.set([heading], { autoAlpha: 1 })

        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          tl.add(splitText())
        })
      }

      createTimeline()
    },
    { scope: container },
  )

  return (
    <section ref={container} className="h-full w-full">
      <div className="flex h-full w-full items-center justify-center">
        <div className="px-safe-max-4 container relative mx-auto md:px-0">
          <h1 className="sr-only">{messages.description}</h1>
          <div
            className="home-landing__heading-text invisible text-[max(2.5rem,min(6vw+1rem,9rem))] font-bold"
            aria-hidden="true"
          >
            {messages.description}
          </div>
        </div>
      </div>

      <FlairFollower target={container}>
        {['🏂', '⛷️', '🏸', '🏓', '🍭', '🤩', '🥳', '🚀', '🏎️'].map((emoji) => (
          <span key={emoji} className="text-6xl">
            {emoji}
          </span>
        ))}
      </FlairFollower>
    </section>
  )
}
