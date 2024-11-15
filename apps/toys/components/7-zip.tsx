'use client'

import { ChangeEventHandler, ReactEventHandler, useRef, useState } from 'react'
import Script from 'next/script'
import { useGSAP } from '@gsap/react'
import { useDrop } from 'ahooks'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { Loader2 } from 'lucide-react'

import { useSaveFile } from '#/hooks/use-save-file'
import {
  useExtractProgressFromStdout,
  useSevenZip,
} from '#/hooks/use-seven-zip'

import { Button } from './ui/button'

gsap.registerPlugin(Flip)

export default function SevenZip() {
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  // const q = gsap.utils.selector(formRef)

  const { pending, onLoad, outputFilesRef, resolve } = useSevenZip()
  const progress = useExtractProgressFromStdout()

  // @ts-expect-error - supported in fact, may be type missing
  useDrop(() => window, {
    onFiles: resolve,
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
  })

  const { isSupportShowSaveFilePicker, saveFile } = useSaveFile()

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files
    if (!files) return
    void resolve(Array.from(files))
  }

  const onSubmit: ReactEventHandler = (e) => {
    e.preventDefault()

    if (outputFilesRef.current.length === 0) {
      return inputRef.current?.click()
    }

    void saveFile(outputFilesRef.current)
  }

  // useGSAP(() => {
  //   const state = Flip.getState(q('button'))
  //   const timeline = Flip.from(state, {
  //     absolute: true,
  //     ease: 'power1.inOut',
  //     targets: q('button'),
  //     scale: true,
  //     simple: true,
  //     onEnter: (elements) => {
  //       return gsap.fromTo(
  //         elements,
  //         {
  //           opacity: 0,
  //           scale: 0,
  //         },
  //         {
  //           opacity: 1,
  //           scale: 1,
  //           delay: 0.2,
  //           duration: 0.3,
  //         },
  //       )
  //     },
  //     onLeave: (elements) => {
  //       return gsap.to(elements, {
  //         opacity: 0,
  //         scale: 0,
  //       })
  //     },
  //     /* onComplete() {
  //       // works around a Safari rendering bug (unrelated to GSAP). Things reflow narrower otherwise.
  //       let boxes = document.querySelector(".boxes"),
  //         lastChild = boxes.lastChild;
  //       boxes.appendChild(lastChild);
  //     } */
  //   })
  // }, [])

  return (
    <>
      <form
        onSubmit={onSubmit}
        ref={formRef}
        className="flex h-[calc(100vh-var(--layout-header-height))] items-center justify-center"
      >
        <input
          className="sr-only"
          type="file"
          multiple
          ref={inputRef}
          onChange={onChange}
        />
        <Button disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {outputFilesRef.current.length !== 0
            ? 'Save'
            : 'Select files to continue'}{' '}
          progress: {progress}
        </Button>
      </form>
      <Script src="/js7z-mt-fs-2.3.0/js7z.js" onLoad={onLoad} />
    </>
  )
}
