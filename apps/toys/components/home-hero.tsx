'use client'

import { useRef, unstable_ViewTransition as ViewTransition } from 'react'
import { useGSAP } from '@gsap/react'
import { useLocale } from '@repo/i18n/client'
import ScrambleText from '@repo/ui/components/scramble-text'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Highlighter from 'react-highlight-words'

import { Messages } from '#/lib/i18n'

import WebassemblyIcon from './webassembly-icon'

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger)

type Props = {
  messages: Messages['home']
}

export default function HomeHero({ messages }: Props) {
  const container = useRef<React.ComponentRef<'div'>>(null)
  const { locale } = useLocale()

  useGSAP(
    (_context, contextSafe) => {
      const selector = gsap.utils.selector(container)
      const heading = selector('.home-hero__heading-text')[0]
      const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })

      document.fonts.ready.then(
        contextSafe!(() => {
          const split = SplitText.create(heading, {
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
            onSplit: (self) => {
              return gsap.from(self.words, {
                yPercent: 100,
                autoAlpha: 0,
                ease: 'back.out',
                stagger: {
                  amount: 0.5,
                  from: 'random',
                },
                scrollTrigger: heading,
                onComplete: () => {
                  split.revert()
                },
              })
            },
          })
        }),
      )
    },
    {
      scope: container,
    },
  )

  return (
    <section className="pb-[20vh] pt-[30vh] xl:min-h-screen xl:pb-10">
      <div
        className="px-safe-max-4 container relative mx-auto md:px-0"
        ref={container}
      >
        <ViewTransition name="webassembly-icon">
          <WebassemblyIcon className="w-50 -top-50 right-safe-max-4 absolute" />
        </ViewTransition>

        <h1 className="sr-only">{messages.hero.heading}</h1>
        <div
          className="home-hero__heading-text pb-10 text-[10vw] lg:text-[8vw]"
          aria-hidden="true"
        >
          <Highlighter
            searchWords={['WebAssembly']}
            textToHighlight={messages.hero.heading}
            highlightTag={({ children }) => (
              <span className="home-hero__highlight bg-(--webassembly-logo-color) rounded-2xl px-6 py-2 leading-[1.6em] text-white">
                {children}
              </span>
            )}
          />
        </div>

        <div className="md:max-w-1/2 xl:max-w-2/3 wrap-anywhere">
          <h3 className="sr-only">{messages.hero.subtitle}</h3>
          <ScrambleText
            asChild
            defaultChars="01"
            trigger={['pointerenter', 'focus']}
          >
            <h3
              aria-hidden="true"
              className="font-mono text-base italic md:text-lg"
            >
              {messages.hero.subtitle}
            </h3>
          </ScrambleText>
        </div>
      </div>
    </section>
  )
}
