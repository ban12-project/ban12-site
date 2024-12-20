'use client'

import { ChangeEventHandler, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDrop } from 'ahooks'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { useSaveFile } from '#/hooks/use-save-file'
import { supportedFormats, useSevenZip } from '#/hooks/use-seven-zip'
import { Button } from '#/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '#/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'

gsap.registerPlugin(Flip)

const FormSchema = z.object({
  format: z.enum(supportedFormats.packingAndUnpacking, {
    required_error: 'Please select an format to continue.',
  }),
})

export default function SevenZip() {
  const [isHovering, setIsHovering] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  // const q = gsap.utils.selector(formRef)

  const { pending, outputFilesRef, resolve, progress } = useSevenZip()

  // @ts-expect-error - supported in fact, may be type missing
  useDrop(() => window, {
    onFiles: (files) => resolve(files, format),
    onDragEnter: () => setIsHovering(true),
    onDragLeave: () => setIsHovering(false),
  })

  const { isSupportShowSaveFilePicker, saveFile } = useSaveFile()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      format: 'ZIP',
    },
  })

  const format = useWatch({ name: 'format', control: form.control })

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files
    if (!files) return
    resolve(Array.from(files), format)
  }

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (outputFilesRef.current.length === 0) {
      return inputRef.current?.click()
    }

    await saveFile(outputFilesRef.current)

    outputFilesRef.current.length = 0
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
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

        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a format to packing" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedFormats.packingAndUnpacking.map((format) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {outputFilesRef.current.length !== 0
            ? 'Save'
            : 'Select files to continue'}{' '}
          progress: {progress}
        </Button>
      </form>
    </Form>
  )
}
