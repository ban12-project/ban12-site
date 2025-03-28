'use client'

import { useEffect, useRef, useState, type ChangeEventHandler } from 'react'
// import { useGSAP } from '@gsap/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@repo/ui/components/button'
import {
  Form,
  FormControl,
  // FormDescription,
  FormField,
  FormItem,
  // FormLabel,
  // FormMessage,
} from '@repo/ui/components/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { Loader2 } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { useSaveFile } from '#/hooks/use-save-file'
import { supportedFormats, useSevenZip } from '#/hooks/use-seven-zip'

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

  useEffect(() => {
    const onDrop = (e: DragEvent) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault()

      if (!e.dataTransfer) return

      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile()
            if (!file) return
            resolve([file], format)
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        resolve(Array.from(e.dataTransfer.files), format)
      }
      setIsHovering(false)
    }

    const onDragOver = (e: DragEvent) => {
      // Prevent default behavior (Prevent file from being opened)
      e.preventDefault()
      setIsHovering(true)
    }

    const onCancel = () => {
      setIsHovering(false)
    }

    window.addEventListener('drop', onDrop)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragend', onCancel)
    window.addEventListener('dragleave', onCancel)

    return () => {
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragend', onCancel)
      window.removeEventListener('dragleave', onCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolve])

  const { saveFile } = useSaveFile()

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

  const onSubmit = async (/* data: z.infer<typeof FormSchema> */) => {
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
        data-drag-over={isHovering}
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
