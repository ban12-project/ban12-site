import { useEffect, useRef, useState } from 'react'
import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegment,
} from 'next/navigation'
import { useLocale } from '@repo/i18n/client'
import type { Messages } from '#/i18n'
import { useDebounceFn } from 'ahooks'
import { CircleX, Search } from 'lucide-react'

import { cn } from '#/lib/utils'

interface SearchBarProps
  extends React.ButtonHTMLAttributes<React.ComponentRef<'form'>> {
  messages: Messages['common']
  setSticky: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SearchBar({
  messages,
  className,
  setSticky,
}: SearchBarProps) {
  const buttonRef = useRef<React.ComponentRef<'button'>>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!buttonRef.current) return
    const { marginLeft } = window.getComputedStyle(buttonRef.current)
    setWidth(buttonRef.current.offsetWidth + Number.parseFloat(marginLeft))
  }, [buttonRef])

  const searchParams = useSearchParams()
  const router = useRouter()
  const { locale } = useLocale()
  const [query, setQuery] = useState(
    searchParams.get('query')?.toString() || '',
  )
  const childrenSegment = useSelectedLayoutSegment('children')
  const isOnSearch = childrenSegment === 'search'

  const { run } = useDebounceFn(
    () => {
      const params = new URLSearchParams(searchParams)
      if (query) {
        params.set('query', query)
      } else {
        return safeBack()
      }
      if (!isOnSearch) {
        router.push(`/${locale}/search?${params.toString()}`)
      } else {
        router.replace(`/${locale}/search?${params.toString()}`)
      }
    },
    { wait: 300 },
  )

  const onSubmit: React.FormEventHandler<React.ComponentRef<'form'>> = (
    event,
  ) => {
    event.preventDefault()
    run()
  }

  const onInput: React.FormEventHandler<React.ComponentRef<'input'>> = (
    event,
  ) => {
    const query = event.currentTarget.value
    setQuery(query)
    run()
  }

  const onCancelButtonClick = () => {
    setQuery('')
    setSticky(false)
    safeBack()
  }

  const safeBack = () => {
    if (!isOnSearch) return

    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(`/${locale}`)
    }
  }

  return (
    <form className={cn('flex h-9', className)} onSubmit={onSubmit}>
      <label className="flex h-full w-full items-center rounded-xl bg-gray-400 bg-opacity-20 p-2 transition-[background-color] active:bg-opacity-30 dark:bg-gray-500 dark:bg-opacity-20">
        <Search className="scale-75 opacity-60" />
        <input
          type="search"
          placeholder={messages.search}
          className="mx-1.5 w-full appearance-none border-none bg-transparent outline-none"
          onFocus={() => setSticky(true)}
          enterKeyHint="search"
          name="query"
          onInput={onInput}
          value={query}
          autoCapitalize="off"
          autoComplete="off"
        />
        {query && (
          <CircleX
            className="animate-fadeIn scale-75 opacity-60"
            onClick={() => {
              setQuery('')
              safeBack()
            }}
          />
        )}
      </label>
      <div
        className="w-0 opacity-0 transition-all duration-300 group-data-[sticky=true]:w-[var(--width)] group-data-[sticky=true]:opacity-100 md:hidden"
        style={{ '--width': width + 'px' } as React.CSSProperties}
      >
        <button
          className="ml-3 h-full whitespace-nowrap text-blue-500 transition-opacity hover:no-underline active:text-blue-500/80 active:opacity-50"
          type="button"
          ref={buttonRef}
          onClick={onCancelButtonClick}
        >
          {messages.cancel}
        </button>
      </div>
    </form>
  )
}
