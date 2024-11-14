import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@repo/i18n/client'
import type { Locale } from '#/i18n'

import { cn } from '#/lib/utils'

type Props = { lang: Locale }

export default function LocaleSwitcher({ lang }: Props) {
  const { i18n } = useLocale()

  const pathName = usePathname()
  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return Object.values(i18n.locales).map((locale) => (
    <Link
      key={locale.lang}
      className={cn(lang === locale.lang && 'text-sky-500')}
      href={redirectedPathName(locale.lang)}
    >
      {locale.label}
    </Link>
  ))
}

function Icon(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path
        d=" M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "
        className="fill-current"
      ></path>
    </svg>
  )
}
