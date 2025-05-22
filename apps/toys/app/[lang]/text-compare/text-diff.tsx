'use client'

import {
  Suspense,
  useDeferredValue,
  useState,
  unstable_ViewTransition as ViewTransition,
} from 'react'
import dynamic from 'next/dynamic'
import { Textarea } from '@repo/ui/components/textarea'
import { LoaderCircleIcon } from 'lucide-react'

const DiffView = dynamic(() => import('./diff-view'), { ssr: false })

export default function TextDiff() {
  const [old, setOld] = useState('')
  const [newer, setNewer] = useState('')
  const deferredOld = useDeferredValue(old)
  const deferredNewer = useDeferredValue(newer)

  return (
    <main className="px-safe-max-4 container mx-auto flex min-h-screen flex-col gap-5">
      <ViewTransition name="title-text-compare">
        <h1 className="w-fit text-xl">Text compare</h1>
      </ViewTransition>

      <form className="flex gap-5">
        <Textarea
          variant="ios"
          placeholder="old text"
          value={old}
          onChange={(e) => setOld(e.target.value)}
        />
        <Textarea
          variant="ios"
          placeholder="new text"
          value={newer}
          onChange={(e) => setNewer(e.target.value)}
        />
      </form>

      <div className="flex-1">
        <Suspense
          fallback={<LoaderCircleIcon className="mx-auto animate-spin" />}
        >
          <DiffView old={deferredOld} newer={deferredNewer} />
        </Suspense>
      </div>

      <p className="text-center">
        Rust crate create by{' '}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/mitsuhiko/similar"
        >
          mitsuhiko
        </a>
      </p>
    </main>
  )
}
