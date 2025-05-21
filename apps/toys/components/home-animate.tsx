'use client'

import { useRef, unstable_ViewTransition as ViewTransition } from 'react'
import { useGSAP } from '@gsap/react'
import { Link, useLocale } from '@repo/i18n/client'
import FlairFollower from '@repo/ui/components/flair-follower'
import OrganizingFiles from '#/public/organizing-files.svg'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

import { Messages } from '#/lib/i18n'

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

type Props = {
  messages: Messages['home']
}

export default function HomeAnimate({ messages }: Props) {
  const container = useRef<React.ComponentRef<'div'>>(null)
  const { locale } = useLocale()

  useGSAP(
    () => {
      const selectors = {
        block: gsap.utils.selector(container),
      }
      const DOM = {
        trigger: selectors.block('.home-animate__trigger')[0],
        textTrack: selectors.block('.home-animate__scroll'),
        intro: selectors.block('.home-animate__intro')[0],
      }

      const triggerDefaults: ScrollTrigger.Vars = {
        start: 'left 70%',
        horizontal: true,
      }

      const intro = () => {
        const heading = DOM.intro.querySelector('.home-animate__intro-heading')
        const text = DOM.intro.querySelector('.home-animate__intro-heading > *')

        gsap.from(text, {
          rotateX: -95,
          duration: 4,
          ease: 'elastic.out(1, 0.3)',
          scrollTrigger: {
            trigger: heading,
            start: 'top 70%',
          },
        })
      }

      const basicWords = () => {
        const segmenter = new Intl.Segmenter(locale, { granularity: 'word' })

        const split = new SplitText(DOM.textTrack, {
          type: 'words',
          wordsClass: 'home-animate__highlight-word',
          prepareText: (text) => {
            return [...segmenter.segment(text)]
              .map((s) => s.segment)
              .join(String.fromCharCode(8204))
          },
          wordDelimiter: /\u200c/,
          autoSplit: true,
        })

        split.words.forEach((word) => {
          gsap.from(word, {
            autoAlpha: 0,
            yPercent: 100,
            ease: 'power2.out',
            duration: 0.6,
            scrollTrigger: {
              trigger: word,
              ...triggerDefaults,
              start: 'left 80%',
            },
          })
        })
      }

      const textGroup = () => {
        const triggers = selectors.block('.home-animate__text-group')

        triggers.forEach((trigger) => {
          const label = trigger.querySelector('.home-animate__text-group-label')
          if (!label) return

          gsap.to(label, {
            yPercent: -100,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: label,
              ...triggerDefaults,
              start: 'left center',
              scrub: 1,
              end: '+=0',
            },
          })

          gsap.to(label, {
            x: () => trigger.clientWidth - label.clientWidth,
            ease: 'none',
            scrollTrigger: {
              trigger,
              ...triggerDefaults,
              start: 'left center',
              end: '+=' + (trigger.clientWidth - label.clientWidth),
              scrub: 1,
            },
          })
        })
      }

      const createTimelines = () => {
        gsap.set(DOM.trigger, { autoAlpha: 1 })
        const mm = gsap.matchMedia()

        mm.add(
          // and (min-width: 1280px)
          '(prefers-reduced-motion: no-preference)',
          () => {
            const scrollTween = gsap.to(DOM.trigger, {
              x: () => -DOM.trigger.clientWidth + window.innerWidth,
              ease: 'none',
              scrollTrigger: {
                trigger: DOM.trigger,
                pin: true,
                scrub: 1,
                end: '+=3000px',
              },
            })

            triggerDefaults.containerAnimation = scrollTween
            intro()
            basicWords()
            textGroup()
          },
        )
      }

      createTimelines()
    },
    { scope: container },
  )

  return (
    <section ref={container} className="overflow-hidden">
      <div className="home-animate__trigger invisible flex min-h-dvh w-fit [&>*]:flex-shrink-0">
        <div className="home-animate__landing w-screen py-[18vh] pt-[20vh]">
          <div className="home-animate__intro px-safe-max-4 container relative mx-auto md:px-0">
            <div className="md:max-w-3/5">
              <ViewTransition name="title-7-zip">
                <Link
                  href="/7-zip"
                  className="home-animate__intro-heading perspective-midrange block"
                >
                  <h3 className="backface-hidden w-fit origin-[50%_0] rounded-xl bg-white px-4 py-2 text-3xl text-black">
                    7-Zip
                  </h3>
                </Link>
              </ViewTransition>
              <p className="home-animate__intro-text pt-20 text-2xl">
                Packing / unpacking: 7z, XZ, BZIP2, GZIP, TAR, ZIP and WIM
                <br />
                Unpacking only: APFS, AR, ARJ, CAB, CHM, CPIO, CramFS, DMG, EXT,
                FAT, GPT, HFS, IHEX, ISO, LZH, LZMA, MBR, MSI, NSIS, NTFS,
                QCOW2, RAR, RPM, SquashFS, UDF, UEFI, VDI, VHD, VHDX, VMDK, XAR
                and Z.
              </p>
            </div>

            <div className="home-animate__intro-icon absolute right-0 top-0 m-auto w-2/5">
              <OrganizingFiles className="h-full w-full fill-current dark:text-white" />
            </div>
          </div>
        </div>

        <div className="home-animate__scroll flex w-fit items-center gap-x-10 pr-[37.037vh] [&>p]:whitespace-nowrap">
          <p className="home-animate__text-group text-[12vh]">
            <ViewTransition name="title-exiftool">
              <strong className="home-animate__text-group-label mr-2 inline-block">
                <Link href="/exif">ExifTool</Link>
              </strong>
            </ViewTransition>
            Read metadata information like Date and Time, Camera Details,
            Exposure Settings, Technical Info, Location, Copyright Information
          </p>

          <p className="home-animate__text-group text-[12vh]">
            <ViewTransition name="title-sha256">
              <strong className="home-animate__text-group-label mr-2 inline-block">
                <Link href="/hash">Sha256</Link>
              </strong>
            </ViewTransition>
            Calc Sha256, just drag and drop it
          </p>

          <p className="home-animate__text-group text-[12vh]">
            <ViewTransition name="title-text-compare">
              <strong className="home-animate__text-group-label mr-2 inline-block">
                <Link href="/text-compare">Text Compare</Link>
              </strong>
            </ViewTransition>
            Compare text differences quickly and efficiently in your browser
            with this WebAssembly-powered tool.
          </p>
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
