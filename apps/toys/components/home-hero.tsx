'use client'

import { useRef, unstable_ViewTransition as ViewTransition } from 'react'
import { useGSAP } from '@gsap/react'
import { useLocale } from '@repo/i18n/client'
import ScrambleText from '@repo/ui/components/scramble-text'
import Webassembly from '#/public/webassembly.svg'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import Highlighter from 'react-highlight-words'

import { Messages } from '#/lib/i18n'

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger)

type Props = {
  messages: Messages['home']
}

export default function HomeHero({ messages }: Props) {
  const container = useRef<React.ComponentRef<'div'>>(null)
  const { locale } = useLocale()

  useGSAP(
    () => {
      const selector = gsap.utils.selector(container)
      const heading = selector('.home-hero__heading-text')[0]

      const defaults = {
        ease: 'power2.out',
        duration: 0.6,
      }

      const splitText = () => {
        const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })
        const highlight = selector('.home-hero__highlight')[0]

        const tl = gsap.timeline({ scrollTrigger: heading })

        const split = new SplitText(heading, {
          type: 'words, lines',
          aria: 'hidden',
          mask: 'lines',
          ignore: '.home-hero__highlight',
          prepareText: (text) => {
            return [...segmenter.segment(text)]
              .map((s) => s.segment)
              .join(String.fromCharCode(8204))
          },
          wordDelimiter: /\u200c/,
          autoSplit: true,
        })

        tl.from(split.words, {
          yPercent: 100,
          ease: 'back.out',
          stagger: {
            amount: 0.5,
            from: 'random',
          },
        })

        tl.from(
          highlight,
          { rotationX: 180, ease: 'back.out(1.7)', duration: 1 },
          '-=.4',
        )

        tl.eventCallback('onComplete', () => {
          split.revert()
        })

        return tl
      }

      const scrambleTextIn = () => {
        const subtitleText = selector('.home-hero__subtitle-text')[0]

        return gsap.from(subtitleText, {
          yPercent: -100,
          autoAlpha: 0,
        })
      }

      const createTimeline = () => {
        const tl = gsap.timeline({
          id: 'home-hero',
          defaults,
        })

        tl.set([heading], { autoAlpha: 1 })

        const mm = gsap.matchMedia()
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          tl.add(splitText())
          tl.add(scrambleTextIn(), '+=0.3')
        })
      }

      createTimeline()
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
          <Webassembly className="w-50 -top-50 right-safe-max-4 absolute" />
        </ViewTransition>

        <h1 className="sr-only">{messages.hero.heading}</h1>

        <Highlighter
          aria-hidden="true"
          className="home-hero__heading-text invisible pb-10 text-[10vw] lg:text-[8vw] block"
          searchWords={['WebAssembly']}
          textToHighlight={messages.hero.heading}
          highlightTag={({ children }) => (
            <span className="perspective-midrange inline-block">
              <span className="home-hero__highlight backface-hidden bg-(--webassembly-logo-color) inline-block origin-[50%_100%] rounded-2xl px-6 py-2 leading-[1.6em] text-white">
                {children}
              </span>
            </span>
          )}
        />

        <div className="home-hero__subtitle md:max-w-1/2 xl:max-w-2/3 wrap-anywhere overflow-hidden">
          <h3 className="sr-only">{messages.hero.subtitle}</h3>
          <ScrambleText
            asChild
            defaultChars="01"
            trigger={['pointerenter', 'focus']}
          >
            <h3
              aria-hidden="true"
              className="home-hero__subtitle-text invisible font-mono text-base italic md:text-lg"
            >
              {messages.hero.subtitle}
            </h3>
          </ScrambleText>
        </div>
      </div>
    </section>
  )
}
