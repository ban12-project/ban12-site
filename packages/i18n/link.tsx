'use client'

import { forwardRef } from 'react'
import NextLink from 'next/link'

import { useLocale } from './i18n'

type Props = React.ComponentPropsWithRef<typeof NextLink>

export const Link = forwardRef<React.ElementRef<'a'>, Props>(function Link(
  { href, ...rest },
  forwardedRef,
) {
  const { locale } = useLocale()

  const isExternal =
    typeof href === 'string'
      ? href.startsWith('http')
      : Boolean(href.pathname?.startsWith('http'))

  if (isExternal) return <NextLink {...rest} href={href} ref={forwardedRef} />

  const hrefWithLocale =
    typeof href === 'string'
      ? `/${locale}${href}`
      : {
          ...href,
          pathname: `/${locale}${href.pathname}`,
        }

  return <NextLink {...rest} href={hrefWithLocale} ref={forwardedRef} />
})
