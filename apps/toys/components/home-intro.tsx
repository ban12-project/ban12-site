'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { useLocale } from '@repo/i18n/client'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Highlighter from 'react-highlight-words'

import { Messages } from '#/lib/i18n'

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger)
// ScrollTrigger.defaults({
//   markers: process.env.NODE_ENV === 'development',
// })

type Props = {
  messages: Messages['home']
}

export default function HomeIntro({ messages }: Props) {
  const container = useRef<React.ComponentRef<'div'>>(null)
  const { locale } = useLocale()

  useGSAP(
    (_context, contextSafe) => {
      const selector = gsap.utils.selector(container)
      const highlight = selector('.home-intro__highlight')
      const subtitle = selector('.home-intro__subtitle')[0]
      const body = selector('.home-intro__body')[0]
      const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })

      document.fonts.ready.then(
        contextSafe!(() => {
          SplitText.create(highlight, {
            type: 'chars, words',
            wordsClass: 'home-intro__highlight-word',
            prepareText: (text) => {
              return [...segmenter.segment(text)]
                .map((s) => s.segment)
                .join(String.fromCharCode(8204))
            },
            wordDelimiter: /\u200c/,
            autoSplit: true,
            onSplit: (self) => {
              return gsap
                .timeline({
                  scrollTrigger: {
                    trigger: subtitle,
                    start: 'top center',
                  },
                })
                .from(subtitle, {
                  yPercent: -100,
                  autoAlpha: 0,
                })
                .from(body, {
                  autoAlpha: 0,
                  y: -50,
                })
                .fromTo(
                  self.chars,
                  {
                    yPercent: 'random(-100, 100)',
                    autoAlpha: 0,
                  },
                  {
                    color: 'var(--webassembly-logo-color)',
                    yPercent: 0,
                    autoAlpha: 1,
                    ease: 'back.out',
                    stagger: {
                      amount: 0.5,
                      from: 'random',
                    },
                    onComplete: () => {
                      // split.revert()
                    },
                  },
                  '<.2',
                )
                .to(self.words[self.words.length - 1].children, {
                  rotateX: '360deg',
                  stagger: 0.2,
                })
            },
          })
        }),
      )
    },
    { scope: container },
  )

  return (
    <section>
      <div className="px-safe-max-4 container mx-auto md:px-0" ref={container}>
        <div className="relative pb-[20vh] pt-[18vh] font-mono before:absolute before:top-0 before:h-[1px] before:w-full before:bg-zinc-300 after:absolute after:bottom-0 after:h-[1px] after:w-full after:bg-zinc-300">
          <h3 className="home-intro__subtitle bg-linear-to-br to-(--webassembly-logo-color) w-fit from-gray-800/80 bg-clip-text text-[max(2vw,1rem)] font-semibold [-webkit-text-fill-color:#0000] dark:from-gray-200/80">
            {messages.intro.subtitle}
          </h3>
          <div>
            <h2 className="sr-only">{messages.intro.body}</h2>

            <Highlighter
              className="home-intro__body block pt-[6vw] text-[3vw]"
              aria-hidden="true"
              searchWords={messages.intro.highlight}
              highlightTag={({ children }) => (
                <span className="home-intro__highlight">{children}</span>
              )}
              textToHighlight={messages.intro.body}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
