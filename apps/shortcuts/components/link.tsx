'use client'

import { forwardRef } from 'react'
import NextLink from 'next/link'

import { useLocale } from '#/components/i18n'

type Props = React.ComponentPropsWithRef<typeof NextLink>

export default forwardRef<React.ElementRef<'a'>, Props>(function Link(
  { href, ...rest },
  forwardedRef,
) {
  const { locale } = useLocale()

  const isExternal =
    typeof href === 'string'
      ? href.startsWith('http')
      : !!href.pathname?.startsWith('http')

  if (isExternal) return <NextLink {...rest} ref={forwardedRef} href={href} />

  const hrefWithLocale =
    typeof href === 'string'
      ? `/${locale}${href}`
      : {
          ...href,
          pathname: `/${locale}${href.pathname}`,
        }

  return <NextLink {...rest} ref={forwardedRef} href={hrefWithLocale} />
})
