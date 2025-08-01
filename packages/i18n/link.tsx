'use client'

import { forwardRef } from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import { useLocale } from './i18n'

type Props = React.ComponentPropsWithRef<typeof NextLink>

export const Link = forwardRef<React.ComponentRef<'a'>, Props>(function Link(
  { href, ...rest },
  forwardedRef,
) {
  const { i18n } = useLocale()
  const pathname = usePathname()
  const segment = pathname.split('/')[1]
  const locale = Object.keys(i18n.locales).includes(segment) ? segment : null

  const isExternal =
    typeof href === 'string'
      ? href.startsWith('http')
      : Boolean(href.pathname?.startsWith('http'))

  if (isExternal || !locale)
    return <NextLink {...rest} href={href} ref={forwardedRef} />

  const hrefWithLocale =
    typeof href === 'string'
      ? `/${locale}${href}`
      : {
          ...href,
          pathname: `/${locale}${href.pathname ?? ''}`,
        }

  return <NextLink {...rest} href={hrefWithLocale} ref={forwardedRef} />
})
